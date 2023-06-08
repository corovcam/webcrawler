# build stage
FROM node:19-alpine as build
WORKDIR /webcrawler/frontend
COPY package*.json /
RUN npm install
COPY . .
RUN npm run build

# production stage
FROM nginx:1.25.0-alpine
COPY --from=build /webcrawler/frontend/build /usr/share/nginx/html
COPY --from=build /webcrawler/frontend/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]