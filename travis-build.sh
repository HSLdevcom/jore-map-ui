#!/bin/bash
set -e

# APP_DOMAIN_NAME, DOCKER_AUTH, DOCKER_USER env values are defined here:
# https://travis-ci.org/HSLdevcom/jore-map-ui/settings

ORG=${ORG:-hsldevcom}
APP_BUILD_DATE=$(date +'%d.%m.%Y')

if [ $TRAVIS_BRANCH == "release-prod" ]; then
  APP_ENVIRONMENT='prod'
  DOCKER_TAG=':release-prod'
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
CYPRESS_DOCKER_TAG=${DOCKER_TAG}-cypress
CYPRESS_DOCKER_IMAGE=$ORG/jore-map-ui${CYPRESS_DOCKER_TAG}

echo "Travis branch is $TRAVIS_BRANCH"
echo "Environment is $APP_ENVIRONMENT"
echo "Domain name is $APP_DOMAIN_NAME"
echo "Docker tag is $DOCKER_TAG"
echo "Docker image is $DOCKER_IMAGE"
echo "Cypress docker tag is $CYPRESS_DOCKER_TAG"
echo "Cypress docker image is $CYPRESS_DOCKER_IMAGE"
echo "Cypress key is $CYPRESS_KEY"

# Build & push cypress image for dev & stage
if [ $TRAVIS_PULL_REQUEST == "false" ] && ([ [ $TRAVIS_BRANCH == "master" ] || [ $TRAVIS_BRANCH == "develop" ]); then
  docker build --build-arg APP_ENVIRONMENT=${APP_ENVIRONMENT} --build-arg APP_CYPRESS_KEY=${APP_CYPRESS_KEY} --build-arg HSLID_CYPRESS_READ_ACCESS_USERNAME=${HSLID_CYPRESS_READ_ACCESS_USERNAME} --build-arg HSLID_CYPRESS_READ_ACCESS_PASSWORD=${HSLID_CYPRESS_READ_ACCESS_PASSWORD} --build-arg HSLID_CYPRESS_WRITE_ACCESS_USERNAME=${HSLID_CYPRESS_WRITE_ACCESS_USERNAME} --build-arg HSLID_CYPRESS_WRITE_ACCESS_PASSWORD=${HSLID_CYPRESS_WRITE_ACCESS_PASSWORD} --build-arg CLIENT_ID=${CLIENT_ID} --build-arg CLIENT_SECRET=${CLIENT_SECRET} --file e2e.dockerfile --tag=$CYPRESS_DOCKER_TAG .
  docker login -u $DOCKER_USER -p $DOCKER_AUTH
  docker push $CYPRESS_DOCKER_IMAGE
fi

docker build --build-arg APP_ENVIRONMENT=${APP_ENVIRONMENT} --build-arg APP_DOMAIN_NAME=${APP_DOMAIN_NAME} --build-arg APP_BUILD_DATE=${APP_BUILD_DATE} --tag=$DOCKER_IMAGE .

if [ $TRAVIS_PULL_REQUEST == "false" ] && ([ $TRAVIS_BRANCH == "release-prod" ] || [ $TRAVIS_BRANCH == "master" ] || [ $TRAVIS_BRANCH == "develop" ]); then
  docker login -u $DOCKER_USER -p $DOCKER_AUTH
  docker push $DOCKER_IMAGE
fi
