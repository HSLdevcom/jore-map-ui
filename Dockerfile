FROM node:12.16.1-alpine

ENV WORK /build

RUN mkdir -p ${WORK}
WORKDIR ${WORK}

# Install app dependencies
COPY yarn.lock ${WORK}
COPY package.json ${WORK}
COPY .yarnrc ${WORK}
RUN yarn

COPY . ${WORK}

ARG APP_ENVIRONMENT
ENV ENVIRONMENT=${APP_ENVIRONMENT}

ARG APP_DOMAIN_NAME
ENV DOMAIN_NAME=${APP_DOMAIN_NAME}

ARG APP_BUILD_DATE
ENV BUILD_DATE=${APP_BUILD_DATE}

RUN yarn test:ci
RUN yarn build

CMD yarn run production
