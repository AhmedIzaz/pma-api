# ============================================
# Stage 1: Install dependencies
# ============================================
FROM node:22-slim AS deps

WORKDIR /app

# Copy only dependency manifests for optimal layer caching
COPY package.json yarn.lock ./

# Install all dependencies
RUN yarn install --frozen-lockfile

# ============================================
# Stage 2: Build the application
# ============================================
FROM node:22-slim AS build

WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code and config files
COPY package.json yarn.lock tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
COPY database ./database
COPY scripts ./scripts

# Build the NestJS application
RUN yarn build

# ============================================
# Stage 3: Production image
# ============================================
FROM node:22-slim AS production

# Add labels for better maintainability
LABEL maintainer="pma-team"
LABEL description="Personal Medical Assistant API"

# Install curl (for healthcheck) and ffmpeg (for audio processing)
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl ffmpeg && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy production node_modules from build stage
COPY --from=build /app/node_modules ./node_modules

# Copy compiled application from build stage
COPY --from=build /app/dist ./dist

# Copy package.json for metadata
COPY package.json ./

COPY tsconfig.json ./

# Copy scripts folder from build stage
COPY --from=build /app/scripts ./scripts

RUN chown -R node:node /app

# Use non-root user for security
USER node

# Expose the application port
EXPOSE 9000

# Healthcheck to verify the app is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:9000 || exit 1

# Start the application
CMD ["node", "dist/src/main"]