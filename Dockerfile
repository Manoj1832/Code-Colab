FROM node:18-alpine AS builder

WORKDIR /app

# Build Frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Build Backend
FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm install --only=production

COPY backend/ ./backend/

# Copy the frontend build artifacts from the builder stage
COPY --from=builder /app/frontend/build ./frontend/build

EXPOSE 80
ENV PORT=80

CMD ["node", "backend/server.js"]
