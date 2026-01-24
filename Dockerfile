# ==============================================
# STAGE 1: Build the React SPA with Vite
# ==============================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --silent

COPY . .

ARG VITE_API_BASE_URL=https://api.hennesy.pro
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ==============================================
# STAGE 2: Serve with Nginx
# ==============================================
FROM nginx:alpine AS production

RUN apk add --no-cache bash

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
