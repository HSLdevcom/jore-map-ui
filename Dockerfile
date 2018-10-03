FROM node:10-alpine

WORKDIR /build
COPY . ./

ARG API_URL
ENV API_URL=${API_URL}

RUN yarn install
RUN yarn build
RUN yarn add serve

EXPOSE 5000

ENTRYPOINT ["yarn", "run"]
CMD ["serve", "-s", "build"]