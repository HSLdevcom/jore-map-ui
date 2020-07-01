const devConstants = {
    LINK_UPDATE_URI: 'link/1270003,1270103,1',
    NODE_UPDATE_URI: 'node/1270103',
    ROUTE_PATH_UPDATE_LINE_ID: '1817',
    IS_ROUTE_PATH_SAVING_PREVENTED: false,
    ROUTE_LIST_UPDATE_URI: 'routes/?routes[0]=4311'
};

const stageConstants = {
    LINK_UPDATE_URI: 'link/0000001,2117231,1',
    NODE_UPDATE_URI: 'node/1260105',
    ROUTE_PATH_UPDATE_LINE_ID: '1819',
    IS_ROUTE_PATH_SAVING_PREVENTED: true,
    ROUTE_LIST_UPDATE_URI: 'routes/?routes[0]=1016B'
};

// Have to use different configs for dev / stage to prevent local db out-of-sync errors
export default Cypress.config().baseUrl.includes('stage') ? stageConstants : devConstants;
