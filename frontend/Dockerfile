FROM nginx:1.27-alpine

RUN apk add --no-cache curl

COPY index.html /usr/share/nginx/html/index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80