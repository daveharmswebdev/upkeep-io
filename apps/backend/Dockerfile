# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package.json and workspaces
COPY package.json package-lock.json* ./
COPY apps/backend/package.json ./apps/backend/
COPY libs/domain/package.json ./libs/domain/
COPY libs/validators/package.json ./libs/validators/
COPY libs/auth/package.json ./libs/auth/

# Install dependencies
RUN npm ci

# Copy source code
COPY apps/backend ./apps/backend
COPY libs ./libs
COPY tsconfig.json ./
COPY tsconfig.backend.json ./
COPY tsconfig.base.json ./

# Build shared libraries first
WORKDIR /app
RUN npm run build --workspace=libs/domain
RUN npm run build --workspace=libs/validators
RUN npm run build --workspace=libs/auth

# Generate Prisma Client
WORKDIR /app/apps/backend
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:18-slim

# Install OpenSSL for Prisma (Debian-based)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY --from=builder /app/package.json /app/package-lock.json* ./
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/libs/domain/package.json ./libs/domain/
COPY --from=builder /app/libs/validators/package.json ./libs/validators/
COPY --from=builder /app/libs/auth/package.json ./libs/auth/

# Install production dependencies
RUN npm ci --production --workspace=apps/backend

# Copy built application and Prisma
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy shared libraries
COPY --from=builder /app/libs ./libs

# Copy TypeScript config files for tsconfig-paths
COPY --from=builder /app/apps/backend/tsconfig.json ./apps/backend/
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/tsconfig.backend.json ./
COPY --from=builder /app/tsconfig.base.json ./

WORKDIR /app/apps/backend

EXPOSE 3000

CMD ["npm", "start"]
