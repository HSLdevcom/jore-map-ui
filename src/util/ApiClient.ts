import endpoints from '~/enums/endpoints';
import IError from '~/models/IError';
import FetchStatusCode from '~/enums/fetchStatusCode';
import ApiClientHelper from './apiClientHelper';

enum RequestMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
}

interface IAuthorizationRequest {
    code: string;
}

type credentials = 'include';

const API_URL = process.env.API_URL || 'http://localhost:3040';

class ApiClient {
    public updateObject = async (entityName: endpoints, object: any) => {
        return this.postRequest(entityName, object);
    }

    public createObject = async (entityName: endpoints, object: any) => {
        return await this.sendRequest(RequestMethod.PUT, entityName, object);
    }

    public deleteObject = async (entityName: endpoints, object: any) => {
        return await this.sendRequest(RequestMethod.DELETE, entityName, object);
    }

    public authorizeUsingCode = async (code: string) => {
        const requestBody: IAuthorizationRequest = { code };
        return await this.sendRequest(
            RequestMethod.POST, endpoints.AUTH, requestBody);
    }

    public getRequest = async (endpoint: endpoints) => {
        return await this.sendRequest(
            RequestMethod.GET, endpoint, {});
    }

    public postRequest = async (endpoint: endpoints, requestBody: any) => {
        return await this.sendRequest(
            RequestMethod.POST, endpoint, requestBody);
    }

    private sendRequest = async (method: RequestMethod, endpoint: endpoints, object: any) => {
        const entityUrl = this.getEntityUrl(endpoint);
        return this.sendRequestToUrl(method, entityUrl, object, 'include');
    }

    private getEntityUrl = (entityName: endpoints) => {
        return `${API_URL}/${entityName}`;
    }

    public sendRequestToUrl = async (
        method: RequestMethod, url: string, object: any, credentials?: credentials,
    ) => {
        const formattedObject = ApiClientHelper.format(object);
        let error : (IError | null) = null;

        try {
            const response = await fetch(url, {
                method,
                body: method === RequestMethod.GET ? undefined : JSON.stringify(formattedObject),
                // To keep the same express session information with each request
                credentials: credentials ? credentials : undefined,
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            if (response.status >= 200 && response.status < 300) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.indexOf('application/json') !== -1) {
                    return await response.json();
                }
                return await response.text();
            }
            error = {
                name: 'Failed to fetch',
                errorCode: response.status,
                message: response.statusText,
            };
        } catch {
            error = {
                name: 'Connectivity error',
                errorCode: FetchStatusCode.CONNECTION_ERROR,
                message: 'Yhteysongelma',
            };
        }

        if (error) {
            throw error;
        }
    }
}

export default new ApiClient();

export {
    RequestMethod,
};
