FROM node:18-alpine AS base

# Frontend Dockerfile
FROM base AS frontend-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM base AS frontend-runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=frontend-deps /app/node_modules ./node_modules
COPY --from=frontend-builder /app/.next ./.next
COPY --from=frontend-builder /app/public ./public
COPY --from=frontend-builder /app/package*.json ./
COPY --from=frontend-builder /app/next.config.js ./
EXPOSE 3000
CMD ["npm", "start"]
