#!/bin/bash
set -e

# APP_DOMAIN_NAME, DOCKER_AUTH, DOCKER_USER env values are defined here:
# https://travis-ci.org/HSLdevcom/jore-map-ui/settings

ORG=${ORG:-hsldevcom}
APP_BUILD_DATE=$(date +'%d.%m.%Y')

if [ $TRAVIS_BRANCH == "release-prod" ]; then
  APP_ENVIRONMENT='prod'
  DOCKER_TAG=':prod'
fi
if [ $TRAVIS_BRANCH == "master" ]; then
  APP_ENVIRONMENT='stage'
  DOCKER_TAG=':stage'
fi
if [ $TRAVIS_BRANCH == "develop" ]; then
  APP_ENVIRONMENT='dev'
  DOCKER_TAG=':develop'
fi
DOCKER_IMAGE=$ORG/jore-map-ui${DOCKER_TAG}

echo "Travis branch is $TRAVIS_BRANCH"
echo "Environment is $APP_ENVIRONMENT"
echo "Domain name is $APP_DOMAIN_NAME"
echo "Docker tag is $DOCKER_TAG"
echo "Docker image is $DOCKER_IMAGE"

docker build --build-arg APP_ENVIRONMENT=${APP_ENVIRONMENT} --build-arg APP_DOMAIN_NAME=${APP_DOMAIN_NAME} --build-arg APP_BUILD_DATE=${APP_BUILD_DATE} --tag=$DOCKER_IMAGE .

if [ $TRAVIS_PULL_REQUEST == "false" ] && ([ $TRAVIS_BRANCH == "master" ] || [ $TRAVIS_BRANCH == "develop" ]); then
  docker login -u $DOCKER_USER -p $DOCKER_AUTH
  docker push $DOCKER_IMAGE
fi
