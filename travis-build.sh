#!/bin/bash
set -e

# Note: values to these variables are defined at travis: https://travis-ci.org/HSLdevcom/jore-map-ui/settings

ORG=${ORG:-hsldevcom}
APP_BUILD_DATE=$(date +'%d.%m.%Y')

DOCKER_TAG=':latest'
if [[ $TRAVIS_BRANCH == "develop" ]]; then
  DOCKER_TAG=':develop'
fi
DOCKER_IMAGE=$ORG/jore-map-ui${DOCKER_TAG}

docker build --build-arg FRONTEND_AFTER_LOGIN_URL=${AFTER_LOGIN_URL} --build-arg BACKEND_API_URL=${API_URL} --build-arg BACKEND_GEOSERVER_URL=${GEOSERVER_URL} --build-arg APP_BUILD_DATE=${APP_BUILD_DATE} --tag=$DOCKER_IMAGE .

if [ $TRAVIS_PULL_REQUEST == "false" ] && ([ $TRAVIS_BRANCH == "master" ] || [ $TRAVIS_BRANCH == "develop" ]); then
  docker login -u $DOCKER_USER -p $DOCKER_AUTH
  docker push $DOCKER_IMAGE
fi
