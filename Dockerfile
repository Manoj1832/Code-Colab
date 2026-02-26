FROM node:18-alpine as builder

WORKDIR /app

COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci

COPY frontend/ ./frontend/
RUN cd frontend && npm run build

FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm ci

COPY backend/ ./backend/

EXPOSE 5000

CMD ["node", "backend/server.js"]
