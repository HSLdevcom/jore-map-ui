FROM node:10-alpine

WORKDIR /build

# Install app dependencies
COPY yarn.lock ./
COPY package.json ./
COPY .yarnrc ./
RUN yarn

COPY . ./

ARG BACKEND_API_URL
ENV API_URL=${BACKEND_API_URL}

ARG BACKEND_GEOSERVER_URL
ENV GEOSERVER_URL=${BACKEND_GEOSERVER_URL}

ARG APP_BUILD_DATE
ENV BUILD_DATE=${APP_BUILD_DATE}

RUN yarn test:ci
RUN yarn build

# TODO: remove? Is this really needed:
EXPOSE 5000

ENTRYPOINT ["yarn", "run"]
CMD ["serve", "-s", "build"]
