FROM node:22-slim

WORKDIR /app

COPY . /app/
RUN yarn install

CMD [ "node", "index.js"]

