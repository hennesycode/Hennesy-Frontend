# ==============================================
# STAGE 1: Build the React SPA with Vite
# ==============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies (ci for reproducible builds)
RUN npm ci --silent

# Copy source code
COPY . .

# Build argument for API URL (fallback, runtime env preferred)
ARG VITE_API_BASE_URL=http://localhost:8000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build the application
RUN npm run build

# ==============================================
# STAGE 2: Serve with Nginx
# ==============================================
FROM nginx:alpine AS production

# Install envsubst for runtime env generation
RUN apk add --no-cache bash

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy entrypoint script for runtime env
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose port 80
EXPOSE 80

# Use entrypoint to generate runtime env before starting nginx
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
