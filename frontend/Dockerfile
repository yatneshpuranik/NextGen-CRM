# Dockerfile for Frontend client
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build React assets
RUN npm run build

# Web server stage
FROM nginx:stable-alpine

# Copy bundled React build folder to Nginx directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration for routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
