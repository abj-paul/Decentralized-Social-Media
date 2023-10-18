FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .
COPY ../../servers.js .

EXPOSE 3002

VOLUME [ "/app/node_modules" ]

CMD [ "npm", "start" ]