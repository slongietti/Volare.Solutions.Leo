# Use official Node.js LTS image
FROM node:18-alpine

ARG PORT

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Expose the port the app runs on
EXPOSE $PORT

# Start the application
CMD ["node", "server.js"]
