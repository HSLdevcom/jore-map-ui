const commonConstants = {
    NEW_OBJECT_TAG: 'new',
};

const developmentConstants = {
    ...commonConstants,
    FADE_DIALOG_TIMEOUT: 500, // milliseconds
};

const productionConstants = {
    ...commonConstants,
    FADE_DIALOG_TIMEOUT: 2500, // milliseconds
};

const isDevelopment = (process.env.NODE_ENV === 'development');

export default isDevelopment ? developmentConstants : productionConstants;
