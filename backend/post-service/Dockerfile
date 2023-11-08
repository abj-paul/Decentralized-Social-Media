FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
COPY create_bucket.sh /etc/minio/

RUN chmod +x /etc/minio/create_bucket.sh
RUN npm install

COPY . .

EXPOSE 3001

VOLUME [ "/app/node_modules" ]

CMD [ "npm", "start" ]
