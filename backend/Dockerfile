# FROM node:18-alpine AS base

# # Backend Dockerfile
# FROM base AS backend-deps
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci --only=production

# FROM base AS backend-builder
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci
# COPY . .
# RUN npm run build

# FROM base AS backend-runner
# WORKDIR /app
# ENV NODE_ENV=production
# COPY --from=backend-deps /app/node_modules ./node_modules
# COPY --from=backend-builder /app/dist ./dist
# COPY --from=backend-builder /app/package*.json ./
# EXPOSE 3001
# CMD ["npm", "start"]
# Base
FROM node:18-alpine AS base

########################################
# 1. Install ALL dependencies (including dev)
########################################
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

########################################
# 2. Build
########################################
FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

########################################
# 3. Production Image
########################################
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3001
CMD ["node", "dist/index.js"]
