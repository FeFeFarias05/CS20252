FROM node:18-alpine AS base

# Backend Dockerfile
FROM base AS backend-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS backend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM base AS backend-runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=backend-deps /app/node_modules ./node_modules
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/package*.json ./
EXPOSE 3001
CMD ["npm", "start"]
