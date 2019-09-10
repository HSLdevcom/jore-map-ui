FROM node:10-alpine

ENV WORK /build

RUN mkdir -p ${WORK}
WORKDIR ${WORK}

# Install app dependencies
COPY yarn.lock ${WORK}
COPY package.json ${WORK}
COPY .yarnrc ${WORK}
RUN yarn

COPY . ${WORK}

ARG BACKEND_API_URL
ENV API_URL=${BACKEND_API_URL}

ARG BACKEND_GEOSERVER_URL
ENV GEOSERVER_URL=${BACKEND_GEOSERVER_URL}

ARG APP_BUILD_DATE
ENV BUILD_DATE=${APP_BUILD_DATE}

RUN yarn test:ci
RUN yarn build

CMD yarn run production
