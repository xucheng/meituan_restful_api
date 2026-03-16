FROM node:0.10

# Install native build dependencies (for gzip, libxmljs)
RUN apt-get update && apt-get install -y \
    build-essential \
    python \
    libxml2-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Install dependencies via package.json (rebuild native modules for Linux)
COPY package.json ./
RUN npm install

# Copy application source
COPY app.js boot.js ./
COPY config/ config/
COPY controller/ controller/
COPY dao/ dao/

EXPOSE 3000

CMD ["node", "app.js"]
