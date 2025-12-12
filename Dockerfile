FROM --platform=linux/amd64 node:lts-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN rm -rf dist/ && npm run build

FROM --platform=linux/amd64 nginx:stable-alpine AS production-stage
COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]