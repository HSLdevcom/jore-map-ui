FROM node:10-alpine

WORKDIR /build
COPY . ./

RUN yarn install
RUN yarn build
RUN yarn add serve

EXPOSE 8080

ENTRYPOINT ["yarn", "run"]
CMD ["serve", "-s", "build"]