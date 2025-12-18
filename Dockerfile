# Build stage
FROM node:lts-krypton AS build

#Port environment variables from env
ARG VITE_NANIT_EMAIL
ENV VITE_NANIT_EMAIL=$VITE_NANIT_EMAIL

ARG VITE_NANIT_PASSWORD
ENV VITE_NANIT_PASSWORD=$VITE_NANIT_PASSWORD

ARG VITE_ALLOWED_IP
ENV VITE_ALLOWED_IP=$VITE_ALLOWED_IP

ARG VITE_ACCESS_CODE
ENV VITE_ACCESS_CODE=$VITE_ACCESS_CODE

ARG VITE_BABY_ID
ENV VITE_BABY_ID=$VITE_BABY_ID

ARG VITE_PHONE_SUFFIX
ENV VITE_PHONE_SUFFIX=$VITE_PHONE_SUFFIX

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