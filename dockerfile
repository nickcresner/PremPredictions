# ---------- Build stage ----------
FROM node:18-alpine AS builder
WORKDIR /app

# Copy manifests first (better cache)
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install deps
WORKDIR /app/frontend
RUN npm ci
WORKDIR /app/backend
RUN npm ci

# Copy the rest of the source
WORKDIR /app
COPY . .

# Build frontend
WORKDIR /app/frontend
RUN npm run build
# If using Vite (outputs "dist"), rename it so server.js finds "build"
RUN if [ -d dist ]; then mv dist build; fi

# ---------- Run stage ----------
FROM node:18-alpine
WORKDIR /app/backend

# Install backend deps (prod-only)
COPY --from=builder /app/backend/package*.json ./
RUN npm ci --omit=dev

# Copy backend source and built frontend
COPY --from=builder /app/backend ./
COPY --from=builder /app/frontend/build ../frontend/build

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

CMD ["node", "server.js"]
