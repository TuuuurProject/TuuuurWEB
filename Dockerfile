FROM --platform=linux/amd64 node:lts-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN rm -rf dist/ && npm run build