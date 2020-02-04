enum EndpointPath {
    AUTH = 'auth',
    EXISTING_SESSION = 'existingSession',
    LOGOUT = 'logout',
    SYNC_LOCAL_DB = 'syncLocalDB',
    LINE = 'line',
    LINE_HEADER_MASS_EDIT = 'lineHeaderMassEdit',
    ROUTE = 'route',
    ROUTEPATH = 'routePath',
    ROUTELINK = 'routeLink',
    NODE = 'node',
    GET_AVAILABLE_NODE_ID = 'getAvailableNodeId',
    GET_AVAILABLE_NODE_IDS_WITH_PREFIX = 'getAvailableNodeIdsWithPrefix',
    STOP_AREA = 'stopArea',
    LINK = 'link',
    SAVE_LOCK = 'saveLock'
}

export default EndpointPath;
