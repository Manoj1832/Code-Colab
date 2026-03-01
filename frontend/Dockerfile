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

EXPOSE 80

CMD ["/bin/bash", "-c", "if [ -n \"$BACKEND_HOST\" ]; then sed -i \"s|__BACKEND_HOST__|$BACKEND_HOST|g\" /etc/nginx/conf.d/default.conf; fi && nginx -g 'daemon off;'"]
