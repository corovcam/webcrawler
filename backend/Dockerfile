# pull official base image
FROM node:19-alpine as base

# set working directory
WORKDIR /webcrawler/backend

# copy dependencies
COPY package*.json /

# install and start as production build
FROM base as production
ENV NODE_ENV=production
RUN npm ci
COPY . .
CMD ["node", "app.js"]

# install and start as development build
FROM base as dev
ENV NODE_ENV=development
RUN npm install -g nodemon && npm install
COPY . .
CMD ["nodemon", "app.js"]
