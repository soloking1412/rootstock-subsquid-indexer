import { TypeormDatabase } from '@subsquid/typeorm-store';
import { processor } from './processor';
import { Block, Transaction, Transfer, Token, Account } from './model';
import * as erc20 from './abi/erc20';

const tokenCache = new Map<string, Token>();
const accountCache = new Map<string, Account>();

processor.run(new TypeormDatabase({ supportHotBlocks: true }), async (ctx) => {
  const blocks: Map<string, Block> = new Map();
  const transactions: Map<string, Transaction> = new Map();
  const transfers: Map<string, Transfer> = new Map();
  const tokens: Map<string, Token> = new Map();
  const accounts: Map<string, Account> = new Map();

  for (const block of ctx.blocks) {
    // Process Block
    const blockEntity = new Block({
      id: block.header.height.toString(),
      number: block.header.height,
      hash: block.header.hash,
      timestamp: new Date(block.header.timestamp),
      parentHash: block.header.parentHash,
      gasUsed: BigInt(block.header.gasUsed),
      gasLimit: BigInt(block.header.gasLimit),
      baseFeePerGas: block.header.baseFeePerGas ? BigInt(block.header.baseFeePerGas) : null,
      transactionCount: block.transactions.length,
    });
    blocks.set(blockEntity.id, blockEntity);

    // Process Transactions
    for (const txn of block.transactions) {
      const txEntity = new Transaction({
        id: txn.hash,
        hash: txn.hash,
        blockNumber: block.header.height,
        timestamp: new Date(block.header.timestamp),
        from: txn.from.toLowerCase(),
        to: txn.to?.toLowerCase() || null,
        value: BigInt(txn.value),
        gasUsed: BigInt(txn.gasUsed || 0),
        gasPrice: BigInt(txn.gasPrice || 0),
        status: txn.status || 0,
        input: txn.input || null,
        contractAddress: txn.contractAddress?.toLowerCase() || null,
      });
      transactions.set(txEntity.id, txEntity);

      await ensureAccount(accounts, txEntity.from, block.header.height, new Date(block.header.timestamp));

      if (txEntity.to) {
        await ensureAccount(accounts, txEntity.to, block.header.height, new Date(block.header.timestamp));
      }
    }

    // Process ERC-20 Transfer Logs
    for (const log of block.logs) {
      try {
        if (log.topics[0] === erc20.events.Transfer.topic) {
          const transfer = erc20.events.Transfer.decode(log);

          const tokenAddress = log.address.toLowerCase();
          const fromAddress = transfer.from.toLowerCase();
          const toAddress = transfer.to.toLowerCase();
          const txHash = log.getTransaction().hash;

          // Ensure token exists
          let token = tokens.get(tokenAddress) || tokenCache.get(tokenAddress);
          if (!token) {
            token = await ctx.store.findOneBy(Token, { id: tokenAddress });
            if (!token) {
              token = new Token({
                id: tokenAddress,
                address: tokenAddress,
                symbol: null,
                name: null,
                decimals: null,
                totalSupply: null,
              });
            }
            tokens.set(tokenAddress, token);
            tokenCache.set(tokenAddress, token);
          }

          await ensureAccount(accounts, fromAddress, block.header.height, new Date(block.header.timestamp));
          await ensureAccount(accounts, toAddress, block.header.height, new Date(block.header.timestamp));

          const transferId = `${txHash}-${log.logIndex}`;
          const transferEntity = new Transfer({
            id: transferId,
            timestamp: new Date(block.header.timestamp),
            from: fromAddress,
            to: toAddress,
            value: transfer.value,
            logIndex: log.logIndex,
          });

          const transaction = transactions.get(txHash);
          const blockEntity = blocks.get(block.header.height.toString());

          if (transaction && blockEntity) {
            transferEntity.transaction = transaction;
            transferEntity.block = blockEntity;
            transferEntity.token = token;
            transfers.set(transferId, transferEntity);
          }
        }
      } catch (error) {
        continue;
      }
    }
  }

  // Set block relations for transactions
  for (const [_, transaction] of transactions) {
    const blockEntity = blocks.get(transaction.blockNumber.toString());
    if (blockEntity) {
      transaction.block = blockEntity;
    }
  }

  // Save entities
  await ctx.store.upsert([...blocks.values()]);
  await ctx.store.upsert([...accounts.values()]);
  await ctx.store.upsert([...tokens.values()]);
  await ctx.store.upsert([...transactions.values()]);
  await ctx.store.insert([...transfers.values()]);

  ctx.log.info(
    `Processed ${blocks.size} blocks, ${transactions.size} txs, ${transfers.size} transfers, ${tokens.size} new tokens`
  );
});

async function ensureAccount(
  accountsMap: Map<string, Account>,
  address: string,
  blockNumber: number,
  timestamp: Date
): Promise<void> {
  const addr = address.toLowerCase();
  if (!accountsMap.has(addr) && !accountCache.has(addr)) {
    const account = new Account({
      id: addr,
      address: addr,
      firstSeenBlock: blockNumber,
      firstSeenTimestamp: timestamp,
    });
    accountsMap.set(addr, account);
    accountCache.set(addr, account);
  }
}