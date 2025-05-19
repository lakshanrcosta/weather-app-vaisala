FROM node:20

WORKDIR /usr/src/app

# Copy only package files first for cache optimization
COPY api/package*.json ./api/
COPY shared/package*.json ./shared/
RUN cd api && npm install && cd ../shared && npm install

# Copy full source
COPY api ./api
COPY shared ./shared

# Build shared module
RUN cd shared && npm run build

# Set working directory to API
WORKDIR /usr/src/app/api
CMD ["npm", "run", "dev"]
