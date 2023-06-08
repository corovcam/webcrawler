# pull official base image
FROM node:19-alpine

# set working directory
WORKDIR /webcrawler/frontend

# copy dependencies
COPY package*.json /

# install app dependencies
RUN npm install

# add app
COPY . .

# start app
CMD ["npm", "start"]