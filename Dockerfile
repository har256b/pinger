FROM node:14-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY src/ ./src/

CMD ["node", "./src/index.js"]
