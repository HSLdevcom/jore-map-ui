enum FetchStatusCode {
    OK = 200,
    NOT_FOUND = 404,
    OBJECT_IS_OUTDATED = 409,
    INTERNAL_SERVER_ERROR = 500,
    CONNECTION_ERROR = 0,
}

export default FetchStatusCode;

const isOk = (statusCode: FetchStatusCode) => {
    return statusCode === FetchStatusCode.OK;
}

const isClientError = (statusCode: FetchStatusCode) => {
    return statusCode < 500 && statusCode >= 400;
}

const isNotFound = (statusCode: FetchStatusCode) => {
    return statusCode === FetchStatusCode.NOT_FOUND;
}

const isServerError = (statusCode: FetchStatusCode) => {
    return statusCode < 600 && statusCode >= 500;
}

export {
  isOk,
  isClientError,
  isNotFound,
  isServerError,
};
