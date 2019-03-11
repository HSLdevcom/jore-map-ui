const commonConstants = {
    DECIMALS_IN_GEOMETRIES: 5,
    MAP_LAYERS_MIN_ZOOM_LEVEL: 15,
    NEW_OBJECT_TAG: 'new',
};

const developmentConstants = {
    ...commonConstants,
    isLoginRequired: false,
    AFTER_LOGIN_URL: 'http://localhost:3000/afterLogin',
    FADE_DIALOG_TIMEOUT: 500, // milliseconds
};

const productionConstants = {
    ...commonConstants,
    isLoginRequired: true,
    AFTER_LOGIN_URL: 'http://jore-map-dev.hsldev.com/afterLogin',
    FADE_DIALOG_TIMEOUT: 2500, // milliseconds
};

const isDevelopment = (process.env.NODE_ENV === 'development');

export default isDevelopment ? developmentConstants : productionConstants;
