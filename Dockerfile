FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY server.js ./
COPY scripts ./scripts
COPY frontend ./frontend

RUN npm run copy-frontend

EXPOSE 5000
CMD [ "npm", "run", "serve" ]
