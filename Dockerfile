FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

# Create volume for logs
VOLUME /usr/src/app/logs

# Expose API port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Run app
CMD ["node", "app.js"]