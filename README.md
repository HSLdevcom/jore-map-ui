# JoreMapUI

### Travis status

[![Build Status](https://travis-ci.org/HSLdevcom/jore-map-ui.svg?branch=develop)](https://travis-ci.org/HSLdevcom/jore-map-ui)

### Cypress status

![Test dev](https://github.com/HSLdevcom/jore-map-ui/workflows/Test%20dev/badge.svg)

![Test stage](https://github.com/HSLdevcom/jore-map-ui/workflows/Test%20stage/badge.svg)

## Install

### Clone the repo via git

```bash
$ git clone https://github.com/HSLdevcom/jore-map-ui
```

### Install dependencies

```bash
$ cd jore-map-ui && yarn install
```

## Run

### Start in development mode

```bash
$ yarn start
```

Runs at http://localhost:3000/

## Release

### Travis builds docker image automatically with

-   `:prod` tag, when code is pushed to `release-prod` branch
-   `:stage` tag, when code is pushed to `master` branch
-   `:dev` tag, when code is pushed to `develop` branch

### Release a new version

- `git checkout master && git pull origin master`
- `yarn run release`-(`major`/`minor`/`patch`)
   - checkouts to a `Release-x.x.x` branch, creates a new tag, updates change log, pushes changes to remote
- make a pull request from `Release-x.x.x` branch -> `master` branch
- make a pull request from `master` branch -> `release-prod` branch
- deploy via `hsl gitlab/jore/jore-map-deploy` repository

## License

MIT © [HSL](https://github.com/HSLdevcom)
