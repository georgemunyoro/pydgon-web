FROM node:14

# Create application working directory
WORKDIR /usr/src/mercury-client

# Install application dependancies
COPY package*.json ./

RUN yarn install

# Bundle application source
COPY . .

EXPOSE 3000
CMD [ "yarn", "start" ]
