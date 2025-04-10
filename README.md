# Joukkoliikennerekisteri Map UI

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

### Github actions builds docker images automatically with

-   `:production` tag, when code is pushed to `master` branch
-   `:develop` tag, when code is pushed to `develop` branch

### Release a new version

(Note that the deployment from `master`-branch works also without a new release, so this might be considered as an obsolete feature.)

-   `git checkout master && git pull origin master`
-   `yarn run release`-(`major`/`minor`/`patch`)
    -   checkouts to a `Release-x.x.x` branch, creates a new tag, updates change log, pushes changes to remote
-   make a pull request from `Release-x.x.x` branch -> `master` branch

## License

MIT © [HSL](https://github.com/HSLdevcom)
