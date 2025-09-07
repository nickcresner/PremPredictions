# ---------- Build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Copy manifests first (cache)
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install deps
WORKDIR /app/frontend
RUN npm ci
WORKDIR /app/backend
RUN npm ci

# Copy source
WORKDIR /app
COPY . .

# Build frontend
WORKDIR /app/frontend
RUN npm run build
# If using Vite (dist), rename so server.js finds "build"
RUN if [ -d dist ]; then mv dist build; fi

# ---------- Run stage ----------
FROM node:20-alpine
WORKDIR /app/backend

RUN apk add --no-cache bash

# Backend deps (prod)
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Backend source
COPY backend/. .

# Copy built frontend for static serving
COPY --from=builder /app/frontend/build ../frontend/build

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

CMD ["node", "server.js"]
