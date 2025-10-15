FROM node:20-bullseye AS base

WORKDIR /app

# Copy package files
COPY package*.json ./

RUN npm install --legacy-peer-deps

# Copy all source files
COPY . .

# Build the Next.js application
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
