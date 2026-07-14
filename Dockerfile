# syntax=docker/dockerfile:1

FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install production dependencies first for better layer caching.
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source.
COPY backend ./backend
COPY public ./public

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Basic container healthcheck against the app's health endpoint.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/api/health || exit 1

CMD ["node", "backend/server.js"]
