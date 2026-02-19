# Stage 1: Install dependencies
FROM node:20-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js telemetry - disable for faster builds
ENV NEXT_TELEMETRY_DISABLED 1

# Capture build-time environment variables (NEXT_PUBLIC_ are baked into the JS)
ARG NEXT_PUBLIC_STORAGE_STRATEGY=local
ARG NEXT_PUBLIC_API_BASE_URL=https://negints.com
ARG NEXT_PUBLIC_APP_URL=https://negints.com
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID

# Set as ENV for the build process
ENV NEXT_PUBLIC_STORAGE_STRATEGY=$NEXT_PUBLIC_STORAGE_STRATEGY
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID

RUN npm run build

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

# Install su-exec for safe privilege dropping
RUN apk add --no-cache su-exec

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Security: Set up system user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy essential files for standalone execution
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy scripts for admin tasks/seeding (source of scripts needed for manual seeds)
COPY --from=builder /app/src/scripts ./src/scripts
COPY --from=builder /app/src/models ./src/models
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/scripts/entrypoint.sh ./scripts/entrypoint.sh

# Ensure storage directory structure and permissions
RUN mkdir -p storage/blog storage/users/avatars storage/payments/receipts storage/documents && \
    chown -R nextjs:nodejs storage && \
    chmod +x ./scripts/entrypoint.sh

# Environment variables for execution
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

EXPOSE 3000

# Entrypoint handles volume permissions and drops root
ENTRYPOINT ["/app/scripts/entrypoint.sh"]

# The command to run (passed to entrypoint.sh)
CMD ["node", "server.js"]
