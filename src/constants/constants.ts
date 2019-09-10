const commonConstants = {
    DECIMALS_IN_GEOMETRIES: 6,
    INTEGER_MAX_VALUE: 2147483647, // Max value at PostgreSQL (4 bytes)
    SMALL_INT_MAX_VALUE: 32767, // Max value at PostgreSQL (2 bytes)
    MAP_LAYERS_MIN_ZOOM_LEVEL: 15,
    NEW_OBJECT_TAG: 'new-',
    GEOCODER_ADDRESS: 'https://api.digitransit.fi/geocoding/v1/search',
    ADDRESS_SEARCH_RESULT_COUNT: 10
};

const developmentConstants = {
    ...commonConstants,
    AFTER_LOGIN_URL: 'http://localhost:3000/afterLogin',
    FADE_ALERT_TIMEOUT: 500, // milliseconds
    IS_LOGIN_REQUIRED: true
};

const productionConstants = {
    ...commonConstants,
    AFTER_LOGIN_URL: `${process.env.FRONTEND_URL}/afterLogin`,
    FADE_ALERT_TIMEOUT: 2500, // milliseconds
    IS_LOGIN_REQUIRED: true // set always true in production
};

const isDevelopment = process.env.NODE_ENV === 'development';

export default (isDevelopment ? developmentConstants : productionConstants);
