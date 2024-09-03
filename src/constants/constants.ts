import Environment from '~/enums/environment';

const environment: Environment = process.env.ENVIRONMENT
    ? (process.env.ENVIRONMENT as Environment)
    : Environment.LOCALHOST;

let APP_URL = '';
let HSL_ID_URL = '';
let HSL_ID_CLIENT_ID = '';
let DIGITRANSIT_CACHED_URL_PREFIX = '';
let DIGITRANSIT_NON_CACHED_URL_PREFIX = '';
switch (environment) {
    case Environment.LOCALHOST: {
        APP_URL = 'http://localhost:3000';
        HSL_ID_URL = 'https://hslid-uat.cinfra.fi';
        HSL_ID_CLIENT_ID = '6549375356227079';
        DIGITRANSIT_CACHED_URL_PREFIX = 'dev-api';
        DIGITRANSIT_NON_CACHED_URL_PREFIX = 'dev-api';
        break;
    }
    case Environment.DEV: {
        APP_URL = `https://${process.env.APP_DOMAIN}`;
        HSL_ID_URL = 'https://hslid-uat.cinfra.fi';
        HSL_ID_CLIENT_ID = '6549375356227079';
        DIGITRANSIT_CACHED_URL_PREFIX = 'cdn';
        DIGITRANSIT_NON_CACHED_URL_PREFIX = 'api';
        break;
    }
    case Environment.STAGE: {
        APP_URL = `https://${process.env.APP_DOMAIN}`;
        HSL_ID_URL = 'https://hslid-uat.cinfra.fi';
        HSL_ID_CLIENT_ID = '6549375356227079';
        DIGITRANSIT_CACHED_URL_PREFIX = 'cdn';
        DIGITRANSIT_NON_CACHED_URL_PREFIX = 'api';
        break;
    }
    case Environment.PROD: {
        APP_URL = `https://${process.env.APP_DOMAIN}`;
        HSL_ID_URL = 'https://id.hsl.fi';
        HSL_ID_CLIENT_ID = '7799731418699567';
        DIGITRANSIT_CACHED_URL_PREFIX = 'cdn';
        DIGITRANSIT_NON_CACHED_URL_PREFIX = 'api';
        break;
    }
    default: {
        throw `Unsupported environment: ${environment}`;
    }
}

const commonConstants = {
    HSL_ID_URL,
    HSL_ID_CLIENT_ID,
    ENVIRONMENT: environment,
    DIGITRANSIT_MAP_URL: `https://${DIGITRANSIT_CACHED_URL_PREFIX}.digitransit.fi`,
    DIGITRANSIT_API_KEY: process.env.REACT_APP_DIGITRANSIT_API_KEY,
    BUILD_DATE: process.env.BUILD_DATE,
    AFTER_LOGIN_URL: `${APP_URL}/afterLogin`,
    DECIMALS_IN_GEOMETRIES: 6, // Max value 6 currenlty at joredb columns: numeric(8,6)
    INTEGER_MAX_VALUE: 2147483647, // Max value at PostgreSQL (4 bytes)
    SMALL_INT_MAX_VALUE: 32767, // Max value at PostgreSQL (2 bytes)
    MAP_LAYERS_MIN_ZOOM_LEVEL: 13,
    MIN_YEAR: 1970,
    MAX_YEAR: 2099,
    NEW_OBJECT_TAG: 'new-',
    GEOCODING_URL: `https://${DIGITRANSIT_NON_CACHED_URL_PREFIX}.digitransit.fi/geocoding/v1/search`,
    OSM_REVERSE_GEOCODING_URL: 'https://nominatim.openstreetmap.org/reverse',
    DIGITRANSIT_REVERSE_GEOCODING_URL: `https://${DIGITRANSIT_NON_CACHED_URL_PREFIX}.digitransit.fi/geocoding/v1/reverse`,
    ADDRESS_SEARCH_RESULT_COUNT: 10,
    LOCAL_STORAGE_KEY_PREFIX: `${environment}_jore_map_`,
};

const developmentConstants = {
    ...commonConstants,
    API_URL: 'http://localhost:3040',
    GEOSERVER_URL: 'http://localhost:8080/geoserver',
    FADE_ALERT_TIMEOUT: 500, // milliseconds
};

const productionConstants = {
    ...commonConstants,
    API_URL: `${APP_URL}/api`,
    GEOSERVER_URL: `${APP_URL}/geoserver`,
    FADE_ALERT_TIMEOUT: 2500, // milliseconds
};

const isDevelopment = process.env.NODE_ENV === 'development';

export default isDevelopment ? developmentConstants : productionConstants;
