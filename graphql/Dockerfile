# pull official base image
FROM node:19-alpine as base

# set working directory
WORKDIR /webcrawler/graphql

# copy dependencies
COPY package*.json /

# install and start as production build
RUN npm ci
COPY . .
CMD ["npm", "start"]