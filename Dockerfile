# --- Build stage: compile the Vite/React frontend ---
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Runtime stage: Express API + prebuilt static frontend ---
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY server.js seo-meta.js ./
COPY public ./public
COPY uploads ./uploads
EXPOSE 5000
CMD ["node", "server.js"]
