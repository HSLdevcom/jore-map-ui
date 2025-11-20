enum EndpointPath {
    AUTH = 'auth',
    EXISTING_SESSION = 'existingSession',
    LOGOUT = 'logout',
    SYNC_LOCAL_DB_MODELS = 'syncLocalDBModels',
    SYNC_LOCAL_DB_STATUS = 'syncLocalDBStatus',
    LINE = 'line',
    LINE_HEADER_MASS_EDIT = 'lineHeaderMassEdit',
    ROUTE = 'route',
    ROUTE_PATH = 'routePath',
    ROUTE_PATH_REMOVE = 'routePathRemove',
    ROUTE_PATH_MASS_EDIT = 'routePathMassEdit',
    ROUTE_PATH_LENGTH = 'routePathLength',
    NODE = 'node',
    GET_AVAILABLE_NODE_ID = 'getAvailableNodeId',
    GET_AVAILABLE_NODE_IDS_WITH_PREFIX = 'getAvailableNodeIdsWithPrefix',
    HASTUS_AREA = 'hastusArea',
    STOP_AREA = 'stopArea',
    LINK = 'link',
    SAVE_LOCK = 'saveLock',
}

export default EndpointPath;
