FROM node:20

ARG SERVERLESS_ACCESS_KEY
ENV SERVERLESS_ACCESS_KEY=$SERVERLESS_ACCESS_KEY

WORKDIR /usr/src/app

COPY serverless/package*.json ./serverless/
COPY shared/package*.json ./shared/

RUN cd serverless && npm install && cd ../shared && npm install

COPY serverless ./serverless
COPY shared ./shared

RUN cd shared && npm run build

WORKDIR /usr/src/app/serverless

CMD ["npm", "run", "dev"]

