FROM node:20.11.1

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install && npm rebuild bcrypt --build-from-source

COPY . .

RUN npm run build

EXPOSE 8080

CMD [ "node", "dist/main" ]