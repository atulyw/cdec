# build stage — put website files in one folder (here we only copy them)
FROM alpine:3.20 AS build
WORKDIR /site
COPY site/ .
RUN test -f index.html

# final stage — Nginx serves that folder as the website
FROM nginx:1.27-alpine AS final
COPY --from=build /site /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
