FROM node:20-alpine AS builder

ENV WORK=/opt/joremapui
WORKDIR ${WORK}

COPY package.json yarn.lock .yarnrc ./
RUN yarn install --frozen-lockfile

COPY . .

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
WORKDIR ${WORK}

RUN yarn global add serve@^14.2.3

COPY --from=builder /opt/joremapui/build ./build

CMD ["serve", "-s", "-l", "5000", "build"]