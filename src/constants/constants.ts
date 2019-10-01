let APP_URL = '';
if (process.env.NODE_ENV === 'development') {
    APP_URL = 'http://localhost:3000';
} else {
    APP_URL = `https://${process.env.ENVIRONMENT}.${process.env.DOMAIN_NAME}`;
}

const commonConstants = {
    BUILD_DATE: process.env.BUILD_DATE,
    AFTER_LOGIN_URL: `${APP_URL}/afterLogin`,
    DECIMALS_IN_GEOMETRIES: 6,
    INTEGER_MAX_VALUE: 2147483647, // Max value at PostgreSQL (4 bytes)
    SMALL_INT_MAX_VALUE: 32767, // Max value at PostgreSQL (2 bytes)
    MAP_LAYERS_MIN_ZOOM_LEVEL: 15,
    NEW_OBJECT_TAG: 'new-',
    ADDRESS_GEOCODING_URL: 'https://api.digitransit.fi/geocoding/v1/search',
    REVERSE_GEOCODING_URL: 'https://nominatim.openstreetmap.org/reverse',
    ADDRESS_SEARCH_RESULT_COUNT: 10
};

const developmentConstants = {
    ...commonConstants,
    API_URL: 'http://localhost:3040',
    GEOSERVER_URL: 'http://localhost:8080/geoserver',
    FADE_ALERT_TIMEOUT: 500, // milliseconds
    IS_LOGIN_REQUIRED: true
};

const productionConstants = {
    ...commonConstants,
    API_URL: `${APP_URL}/api`,
    GEOSERVER_URL: `${APP_URL}/geoserver`,
    FADE_ALERT_TIMEOUT: 2500, // milliseconds
    IS_LOGIN_REQUIRED: true // set always true in production
};

const isDevelopment = process.env.NODE_ENV === 'development';

export default isDevelopment ? developmentConstants : productionConstants;
