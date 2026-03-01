# ---- Stage 1: Install dependencies ----
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ---- Stage 2: Build the application ----
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate the synthetic data at build time
RUN npx tsx scripts/generate-data.ts

# Build the Next.js app (produces .next/standalone)
RUN npm run build

# ---- Stage 3: Production runner ----
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the standalone server
COPY --from=builder /app/.next/standalone ./

# Copy static assets and public files
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy generated data
COPY --from=builder /app/data ./data

# Ensure the data directory is writable for analytics persistence
RUN chown -R nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
