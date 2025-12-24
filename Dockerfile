# Build stage
FROM node:lts-krypton AS build

#Port environment variables from env
ARG VITE_NANIT_ACCOUNTS
ENV VITE_NANIT_ACCOUNTS=$VITE_NANIT_ACCOUNTS

ARG VITE_BABY_ID
ENV VITE_BABY_ID=$VITE_BABY_ID

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Install gettext-base for envsubst
RUN apk add --no-cache gettext
# Copy nginx config and rename it to .template
COPY nginx.conf /etc/nginx/conf.d/default.conf.template
# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html
# Environment substitution
#RUN /bin/sh -c "envsubst '${API_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf"
EXPOSE 80
# Sets the env variable to default if one not provided
# performs env subsitution in nginx config
# Runs nginx
CMD export NGINX_API_URL=${API_URL:-127.0.0.1} && \
    envsubst '${NGINX_API_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && \
    nginx -g 'daemon off;'