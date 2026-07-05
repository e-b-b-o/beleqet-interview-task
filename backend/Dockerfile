# ─── Build stage ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# openssl is required by Prisma on alpine
RUN apk add --no-cache openssl

# Install dependencies first (layer-cached unless package.json changes)
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Copy source and build
COPY . .

RUN npm run prisma:generate
RUN npm run build

# ─── Production stage ───────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules  ./node_modules
COPY --from=builder /app/dist          ./dist
COPY --from=builder /app/prisma        ./prisma

EXPOSE 4000

# Startup order:
#   1. Apply all pending Prisma migrations (creates schema on a fresh DB)
#   2. Seed the database with initial data (idempotent — safe to run again)
#   3. Start the NestJS application
CMD sh -c "npx prisma migrate deploy && npm run prisma:seed && npm run start:prod"
