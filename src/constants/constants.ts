import Environment from '~/enums/environment';

let APP_URL = '';
if (process.env.NODE_ENV === 'development') {
    APP_URL = 'http://localhost:3000';
} else {
    APP_URL = `https://${process.env.ENVIRONMENT}.${process.env.DOMAIN_NAME}`;
}
const environment: Environment = process.env.ENVIRONMENT
    ? (process.env.ENVIRONMENT as Environment)
    : Environment.LOCALHOST;

const commonConstants = {
    ENVIRONMENT: environment,
    BUILD_DATE: process.env.BUILD_DATE,
    AFTER_LOGIN_URL: `${APP_URL}/afterLogin`,
    DECIMALS_IN_GEOMETRIES: 6, // Max value 6 currenlty at joredb columns: numeric(8,6)
    INTEGER_MAX_VALUE: 2147483647, // Max value at PostgreSQL (4 bytes)
    SMALL_INT_MAX_VALUE: 32767, // Max value at PostgreSQL (2 bytes)
    MAP_LAYERS_MIN_ZOOM_LEVEL: 13,
    NEW_OBJECT_TAG: 'new-',
    ADDRESS_GEOCODING_URL: 'https://api.digitransit.fi/geocoding/v1/search',
    STREET_NAME_REVERSE_GEOCODING_URL: 'https://nominatim.openstreetmap.org/reverse',
    POSTAL_NUMBER_REVERSE_GEOCODING_URL: 'https://api.digitransit.fi/geocoding/v1/reverse',
    ADDRESS_SEARCH_RESULT_COUNT: 10,
    LOCAL_STORAGE_KEY_PREFIX: `${environment}_jore_map_`
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

export default (isDevelopment ? developmentConstants : productionConstants);
