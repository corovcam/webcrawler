# pull official base image
FROM node:19-alpine as base

# set working directory
WORKDIR /webcrawler/backend

# copy dependencies
COPY package*.json /

# install and start as production build
FROM base as production
RUN npm ci
COPY . .
CMD ["npm", "start"]

# install and start as development build
FROM base as dev
ENV NODE_ENV=development
ENV DEBUG=nodejs-docker-express:*
RUN npm install -g nodemon && npm install
COPY . .
CMD ["npm", "run", "dev"]
