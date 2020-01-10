import Moment from 'moment';
import httpStatusDescriptionCodeList from '~/codeLists/httpStatusDescriptionCodeList';
import constants from '~/constants/constants';
import EndpointPath from '~/enums/endpointPath';
import FetchStatusCode from '~/enums/fetchStatusCode';
import IError from '~/models/IError';
import AlertStore from '~/stores/alertStore';
import LoginStore from '~/stores/loginStore';
import ApolloClient from '~/util/ApolloClient';

enum RequestMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE'
}

interface IAuthorizationRequest {
    code: string;
}

type credentials = 'include';

class ApiClient {
    public updateObject = async (endpointPath: EndpointPath, object: any) => {
        const response = await this.postRequest(endpointPath, object);
        ApolloClient.clearStore();
        return response;
    };

    public createObject = async (endpointPath: EndpointPath, object: any) => {
        const response = await this.sendBackendRequest(RequestMethod.PUT, endpointPath, object);
        ApolloClient.clearStore();
        return response;
    };

    public deleteObject = async (endpointPath: EndpointPath, object: any) => {
        return await this.sendBackendRequest(RequestMethod.DELETE, endpointPath, object);
    };

    public authorizeUsingCode = async (code: string) => {
        const requestBody: IAuthorizationRequest = { code };
        return await this.sendBackendRequest(RequestMethod.POST, EndpointPath.AUTH, requestBody);
    };

    public getRequest = async (endpointPath: EndpointPath) => {
        return await this.sendBackendRequest(RequestMethod.GET, endpointPath, {});
    };

    public postRequest = async (endpointPath: EndpointPath, requestBody: any) => {
        return await this.sendBackendRequest(RequestMethod.POST, endpointPath, requestBody);
    };

    private sendBackendRequest = async (
        method: RequestMethod,
        endpointPath: EndpointPath,
        object: any
    ) => {
        const entityUrl = `${constants.API_URL}/${endpointPath}`;
        return this.sendRequest(method, entityUrl, object, 'include');
    };

    public sendRequest = async (
        method: RequestMethod,
        url: string,
        object: any,
        credentials?: credentials
    ) => {
        const formattedObject = _format(object);
        let error: IError | null = null;

        try {
            const response = await fetch(url, {
                method,
                body: method === RequestMethod.GET ? undefined : JSON.stringify(formattedObject),
                // To keep the same express session information with each request
                credentials: credentials ? credentials : undefined,
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.status >= 200 && response.status < 300) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.indexOf('application/json') !== -1) {
                    return await response.json();
                }
                return await response.text();
            }
            if (response.status === 403) {
                AlertStore!
                    .setFadeMessage({ message: httpStatusDescriptionCodeList[403] })
                    .then(() => {
                        LoginStore.clear();
                    });
                error = {
                    name: 'Forbidden',
                    errorCode: FetchStatusCode.FORBIDDEN,
                    message: 'Kielletty toimenpide'
                };
            } else {
                const responseText = await response.text();
                const errorMessage = responseText ? responseText : response.statusText;
                error = {
                    name: 'Failed to fetch',
                    errorCode: response.status,
                    message: errorMessage
                };
            }
        } catch {
            error = {
                name: 'Connectivity error',
                errorCode: FetchStatusCode.CONNECTION_ERROR,
                message: 'Yhteysongelma'
            };
        }

        if (error) {
            throw error;
        }
    };
}

// Formats the object to include dates as formatted strings, instead of Date objects
const _format = (obj: object) => {
    const entries = Object.entries(obj);
    const dates = entries
        .filter(([key, value]: [string, any]) => value instanceof Date)
        .map(([key, value]: [string, Date]) => [key, Moment(value).format()] as [string, string]);

    return {
        ...obj,
        ..._arrayToObject(dates)
    };
};

const _arrayToObject = (arr: [string, any][]) => {
    const res = {};
    arr.forEach(([key, value]: [string, any]) => {
        res[key] = value;
    });
    return res;
};

export default new ApiClient();

export { RequestMethod };
