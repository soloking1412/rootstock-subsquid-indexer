import * as p from '@subsquid/evm-codec'
import { event, viewFun, indexed } from '@subsquid/evm-abi'

export const events = {
    Transfer: event("0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef", "Transfer(address,address,uint256)", {
        from: indexed(p.address),
        to: indexed(p.address),
        value: p.uint256
    }),
}

export const functions = {
    name: viewFun("0x06fdde03", "name()", {}, p.string),
    symbol: viewFun("0x95d89b41", "symbol()", {}, p.string),
    decimals: viewFun("0x313ce567", "decimals()", {}, p.uint8),
    totalSupply: viewFun("0x18160ddd", "totalSupply()", {}, p.uint256),
    balanceOf: viewFun("0x70a08231", "balanceOf(address)", {account: p.address}, p.uint256),
}