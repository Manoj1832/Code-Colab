FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

RUN apk add --no-cache bash sed

COPY --from=builder /app/build /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY docker-entrypoint.sh /docker-entrypoint.d/01-configure.sh

RUN chmod +x /docker-entrypoint.d/01-configure.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
