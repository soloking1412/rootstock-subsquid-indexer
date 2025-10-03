FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/ ./src/
COPY schema.graphql ./

# Build the application
RUN npm run build

FROM node:18-alpine AS runtime

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/schema.graphql ./
COPY --from=builder /app/src/model ./src/model

# Create logs directory
RUN mkdir -p logs

# Create non-root user
RUN addgroup -g 1001 -S squid && \
    adduser -S squid -u 1001

USER squid

EXPOSE 3000

CMD ["node", "-r", "dotenv/config", "lib/main.js"]