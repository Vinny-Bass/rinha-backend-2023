FROM node:20.12.2-alpine

WORKDIR /app

COPY . .

RUN npm install

RUN npm install -g forever

CMD ["forever", "-f", "src/index.js"]