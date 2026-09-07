# Multi-stage Dockerfile for SmartHire AI React Frontend
FROM node:20-alpine AS build
WORKDIR /app

# Copy package manifests and install dependencies
COPY package*.json ./
RUN npm ci --silent

# Copy source code and build production bundle
COPY . .
RUN npm run build

# Stage 2: Minimal Nginx Alpine server
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html

# Clean default nginx files
RUN rm -rf ./*

# Copy built assets from build stage
COPY --from=build /app/dist .

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
