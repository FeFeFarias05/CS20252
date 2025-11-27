FROM node:18-alpine AS base

# Frontend Dockerfile with production support
FROM base AS frontend-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Build arguments for API URL configuration
ARG NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

FROM base AS frontend-runner
WORKDIR /app
ENV NODE_ENV=production

ARG NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY --from=frontend-deps /app/node_modules ./node_modules
COPY --from=frontend-builder /app/.next ./.next
COPY --from=frontend-builder /app/package*.json ./
COPY --from=frontend-builder /app/next.config.js ./
COPY --from=frontend-builder /app/public ./public

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["npm", "start"]
