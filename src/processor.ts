import { EvmBatchProcessor } from '@subsquid/evm-processor';
import * as erc20 from './abi/erc20';

const ROOTSTOCK_MAINNET_RPC = process.env.ROOTSTOCK_RPC || 'https://public-node.rsk.co';
const ROOTSTOCK_TESTNET_RPC = 'https://public-node.testnet.rsk.co';
const NETWORK = process.env.NETWORK || 'mainnet';
const RPC_ENDPOINT = NETWORK === 'testnet' ? ROOTSTOCK_TESTNET_RPC : ROOTSTOCK_MAINNET_RPC;
const START_BLOCK = parseInt(process.env.START_BLOCK || '6000000');

export const processor = new EvmBatchProcessor()
  .setRpcEndpoint({
    url: RPC_ENDPOINT,
    rateLimit: 10,
    maxBatchCallSize: 100,
  })
  .setFinalityConfirmation(75)
  .setBlockRange({ from: START_BLOCK })
  .setFields({
    block: {
      gasUsed: true,
      gasLimit: true,
      baseFeePerGas: true,
    },
    transaction: {
      value: true,
      gasUsed: true,
      gasPrice: true,
      status: true,
      input: true,
      contractAddress: true,
    },
    log: {
      data: true,
      topics: true,
    },
  })
  .addLog({
    topic0: [erc20.events.Transfer.topic],
    transaction: true,
  })
  .addTransaction({
    range: { from: START_BLOCK },
  });