FROM node:12.16.1-alpine AS builder

ENV WORK=/opt/joremapui

RUN mkdir -p ${WORK}
WORKDIR ${WORK}

# Install app dependencies
COPY yarn.lock package.json .yarnrc ${WORK}
RUN yarn install --ignore-scripts

COPY . ${WORK}

ARG APP_ENVIRONMENT
ENV ENVIRONMENT=${APP_ENVIRONMENT}

ARG APP_REACT_APP_DIGITRANSIT_API_KEY
ENV REACT_APP_DIGITRANSIT_API_KEY=${APP_REACT_APP_DIGITRANSIT_API_KEY}

ARG APP_DOMAIN
ENV APP_DOMAIN=${APP_DOMAIN}

ARG APP_BUILD_DATE
ENV BUILD_DATE=${APP_BUILD_DATE}

RUN yarn test:ci
RUN yarn build


FROM node:20-alpine AS server

ENV WORK=/opt/joremapui

# Create app directory
RUN mkdir -p ${WORK}
WORKDIR ${WORK}

# Install serve
RUN yarn global add serve@^14.2.3

COPY --from=builder /opt/joremapui/build build/

CMD ["serve", "-s", "-l", "5000", "build/"]
