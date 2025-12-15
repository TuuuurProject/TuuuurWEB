FROM --platform=linux/amd64 node:lts-alpine AS build-stage
WORKDIR /app

# Argument pour définir l'environnement (preprod, production, etc.)
ARG BUILD_ENV=preprod
ARG VITE_GOOGLE_CLIENT_ID

COPY package*.json ./
RUN npm install
COPY . .

# Copier le fichier .env correspondant à l'environnement
RUN if [ -f ".env.${BUILD_ENV}" ]; then \
      cp ".env.${BUILD_ENV}" .env; \
    else \
      echo "Warning: .env.${BUILD_ENV} not found, using .env.exemple"; \
      cp .env.exemple .env; \
    fi

RUN echo "VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}" >> .env; \

RUN rm -rf dist/ && npm run build

FROM --platform=linux/amd64 nginx:stable-alpine AS production-stage
COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]