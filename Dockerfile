FROM node:10-alpine

WORKDIR /build
COPY . ./

RUN yarn install
RUN yarn build
RUN yarn add serve

EXPOSE 5000

ENTRYPOINT ["yarn", "run"]
CMD ["serve", "-s", "build"]