# JoreMapUI

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

### Build and run in Docker container

```bash
$ # Specify location of API:s

$ # stage urls example
$ # ${API_URL} = "http://jore-map-dev.hsldev.com/api/"
$ # ${GEOSERVER_URL} = "http://jore-map-dev.hsldev.com/geoserver"

$ docker build BACKEND_API_URL=${API_URL} --build-arg BACKEND_GEOSERVER_URL=${GEOSERVER_URL} --tag=$DOCKER_IMAGE .

$ # Use default API:s locations (localhost)

$ docker build -t jore-map-ui .

$ docker run -d -p 0.0.0.0:5000:5000 jore-map-ui
```

## License

MIT © [HSL](https://github.com/HSLdevcom)
