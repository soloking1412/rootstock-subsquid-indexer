# Rootstock Subsquid Indexer

A production-ready Subsquid indexer for Rootstock blockchain that indexes blocks, transactions, and ERC-20 transfers with a GraphQL API.

## Features

- ✅ **Block Indexing**: Complete block data including gas usage, timestamps, and metadata
- ✅ **Transaction Indexing**: All transaction details with status, gas costs, and contract interactions
- ✅ **ERC-20 Transfer Tracking**: Real-time ERC-20 token transfer indexing
- ✅ **Token Registry**: Automatic token discovery and metadata tracking
- ✅ **Account Tracking**: First-seen block tracking for all addresses
- ✅ **GraphQL API**: Rich querying capabilities with pagination and filtering
- ✅ **Rootstock Support**: Configured for both mainnet and testnet
- ✅ **Production Ready**: Docker support, comprehensive error handling

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git
- **Rootstock RPC API Key** - Get yours free at [https://rpc.rootstock.io/](https://rpc.rootstock.io/)

### Installation

> **📌 Important**: Before starting, sign up at [https://rpc.rootstock.io/](https://rpc.rootstock.io/) to get your free RPC API key. You'll need this to connect to the Rootstock network.

Users can get started with:

```bash
# Clone the repository
git clone <your-repo-url>
cd rootstock-subsquid-indexer

# Copy environment template
cp .env.example .env

# Get your Rootstock RPC API key from https://rpc.rootstock.io/
# Then update ROOTSTOCK_RPC in .env with your API key

# Install dependencies
npm install

# Generate TypeORM models from GraphQL schema
npm run codegen

# Build the TypeScript project
npm run build

# Start database (Docker)
npm run up

# Generate and run migrations
npm run db:generate
npm run db:migrate

# Start processor (Terminal 1)
npm run processor:start

# Start GraphQL server (Terminal 2)
npm run query:start

# Visit GraphQL Playground
open http://localhost:4351/graphql
```

> **⚠️ Important**: If you get a "Failed to resolve model" error when running `db:generate`, make sure you've run both `npm run codegen` and `npm run build` first. See the [Troubleshooting](#troubleshooting) section for more details.

## Configuration

### Environment Variables

The `.env` file contains all configuration options:

```bash
# Database Configuration
DB_NAME=squid
DB_PORT=5432
DB_HOST=localhost
DB_USER=postgres
DB_PASS=postgres
DB_SSL=false

# Network Configuration (mainnet or testnet)
NETWORK=mainnet

# Rootstock RPC Endpoint
# Get your API key from: https://rpc.rootstock.io/
ROOTSTOCK_RPC=https://rpc.rootstock.io/<YOUR_API_KEY>

# Start block for indexing
START_BLOCK=6000000

# GraphQL Server
GQL_PORT=4351

# Processor
PROCESSOR_PROMETHEUS_PORT=3001
```

### Rootstock RPC Configuration

To use this indexer, you need to get your own RPC API key:

1. **Visit [https://rpc.rootstock.io/](https://rpc.rootstock.io/)** to sign up and get your API key
2. **Update your `.env` file** with your API key:
   ```bash
   ROOTSTOCK_RPC=https://rpc.rootstock.io/<YOUR_API_KEY>
   ```
3. **For testnet**, use the testnet endpoint with your API key

**Why use the official RPC API?**
- Better reliability and uptime
- Higher rate limits
- Official Rootstock support
- Free tier available for development

## GraphQL API

### Available Queries

#### Blocks
```graphql
query {
  blocks(first: 10) {
    nodes {
      id
      number
      hash
      timestamp
      gasUsed
      gasLimit
      transactionCount
    }
    totalCount
  }

  block(id: "123456") {
    number
    hash
    transactions {
      hash
      from
      to
      value
    }
  }
}
```

#### Transactions
```graphql
query {
  transactions(first: 10, from: "0x...") {
    nodes {
      hash
      from
      to
      value
      gasUsed
      status
      block {
        number
        timestamp
      }
    }
    totalCount
  }
}
```

#### ERC-20 Transfers
```graphql
query {
  transfers(first: 10, token: "0x...") {
    nodes {
      id
      from
      to
      value
      token {
        address
        symbol
        name
      }
      transaction {
        hash
      }
      block {
        number
        timestamp
      }
    }
    totalCount
  }
}
```

#### Tokens
```graphql
query {
  tokens(first: 10, search: "RIF") {
    nodes {
      address
      symbol
      name
      decimals
      transfers {
        value
        from
        to
      }
    }
    totalCount
  }
}
```

#### Accounts
```graphql
query {
  accounts(first: 10) {
    nodes {
      address
      firstSeenBlock
      firstSeenTimestamp
    }
  }

  account(id: "0x...") {
    address
    firstSeenBlock
    firstSeenTimestamp
  }
}
```

### Filtering and Pagination

All list queries support:
- `first`: Number of items to return (default: 20)
- `offset`: Number of items to skip (default: 0)
- Entity-specific filters (token address, account address, etc.)

## Project Structure

```
src/
├── abi/
│   └── erc20.ts              # ERC-20 ABI definitions
├── model/
│   ├── generated/            # Generated TypeORM entities
│   └── index.ts             # Model exports
├── server-extension/
│   └── resolvers/           # GraphQL resolvers
├── main.ts                  # Main processor logic
└── processor.ts             # Processor configuration

schema.graphql               # GraphQL schema definition
docker-compose.yml           # Database setup
.env                        # Environment configuration
```

## Development

### Available Scripts

```bash
# Code Generation & Build
npm run codegen              # Generate TypeORM models from GraphQL schema
npm run build                # Build TypeScript to JavaScript

# Database operations
npm run db:generate          # Generate migrations (requires DB running)
npm run db:migrate           # Apply migrations
npm run db:create            # Create new migration
npm run db:drop              # Revert last migration

# Development
npm run processor:start      # Start processor
npm run query:start          # Start GraphQL server

# Docker
npm run up                   # Start database
npm run down                 # Stop database

# Utilities
npm run clean                # Clean build artifacts
```

### Adding New Entities

1. Update `schema.graphql` with new entity definition
2. Run `npm run codegen` to generate TypeORM entities
3. Run `npm run build` to compile TypeScript
4. Generate migration with `npm run db:generate`
5. Apply migration with `npm run db:migrate`
6. Add processing logic in `src/main.ts`
7. Update GraphQL resolvers if needed

### Alternative RPC Endpoints

While we recommend using the official [rpc.rootstock.io](https://rpc.rootstock.io/) service, you can use alternative endpoints if needed:

```bash
ROOTSTOCK_RPC=https://your-alternative-rpc-endpoint.com
```

Note: Alternative endpoints may have different rate limits and reliability.

## Production Deployment

### Docker Deployment

1. **Build the application**:
```bash
npm run build
```

2. **Configure environment** for production:
```bash
# Use production database credentials
DB_HOST=your-production-db-host
DB_USER=your-production-db-user
DB_PASS=your-production-db-password

# Use your Rootstock RPC API key from https://rpc.rootstock.io/
ROOTSTOCK_RPC=https://rpc.rootstock.io/<YOUR_API_KEY>
```

3. **Run migrations**:
```bash
npm run db:migrate
```

4. **Start services**:
```bash
# Start processor
npm run processor:start

# Start GraphQL server (separate container/process)
npm run query:start
```

### Performance Optimization

- **Database**: Use PostgreSQL with appropriate indexes
- **RPC Limits**: Configure `rateLimit` and `maxBatchCallSize` in processor
- **Caching**: Token and account caches reduce database queries
- **Batch Size**: Adjust processor batch size based on resource constraints

## Monitoring

The processor includes built-in logging that reports:
- Blocks processed per batch
- Transactions indexed
- ERC-20 transfers found
- New tokens discovered
- Processing performance metrics

## Security

This project maintains zero npm audit vulnerabilities:
- Regular dependency updates
- No known security issues in production dependencies
- Minimal dependency footprint for better security posture

To verify security status:
```bash
npm audit
```

## Troubleshooting

### Common Issues

1. **"Failed to resolve model" Error**:
   - Run `npm run codegen` to generate TypeORM models
   - Run `npm run build` to compile TypeScript
   - Ensure `lib/` directory exists before running migrations
   - This is the most common setup issue!

2. **Database Connection Failed**:
   - Ensure Docker is running
   - Start PostgreSQL with `npm run up`
   - Check database credentials in `.env`
   - Verify database is accessible on port 5432

3. **"No changes in database schema" When Generating Migration**:
   - This means migrations are already up-to-date
   - Check `db/migrations/` for existing migrations
   - Run `npm run db:migrate` to apply existing migrations

4. **RPC Connection Issues**:
   - Verify you have a valid API key from [https://rpc.rootstock.io/](https://rpc.rootstock.io/)
   - Check that your `ROOTSTOCK_RPC` is correctly formatted: `https://rpc.rootstock.io/<YOUR_API_KEY>`
   - Ensure your API key has sufficient rate limits for your indexing needs
   - Verify network connectivity

5. **GraphQL Server Won't Start**:
   - Ensure database is migrated (`npm run db:migrate`)
   - Check port availability (default: 4351)
   - Verify TypeORM entities are properly generated

6. **Processor Performance**:
   - Adjust `START_BLOCK` to start from a more recent block
   - Reduce batch size if memory issues occur
   - Monitor RPC rate limits

### Support

For issues and questions:
1. Check the [Subsquid Documentation](https://docs.subsquid.io/)
2. Review processor logs for specific error messages
3. Verify Rootstock RPC endpoint status

## License

MIT License

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

Built with ❤️ using [Subsquid](https://subsquid.io) for Rootstock blockchain indexing.