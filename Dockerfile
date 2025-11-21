FROM --platform=linux/amd64 node:lts-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm run lint
COPY . .
RUN rm -rf dist/
RUN npm run build