import entityNames from '~/enums/entityNames';
import FetchStatusCode from '~/enums/fetchStatusCode';
import ApiClientHelper from './apiClientHelper';

enum RequestMethod {
    POST= 'POST',
    PUT= 'PUT',
    DELETE= 'DELETE',
}

export class IRequestError {
    errorCode: FetchStatusCode;
    message: string;
}

const API_URL = process.env.API_URL || 'http://localhost:3040';

export default class ApiClient {
    public async updateObject(entityName: entityNames, object: any) {
        return await this.sendRequest(RequestMethod.POST, entityName, object);
    }

    public async addObject(entityName: entityNames, object: any) {
        return await this.sendRequest(RequestMethod.PUT, entityName, object);
    }

    public async deleteObject(entityName: entityNames, object: any) {
        return await this.sendRequest(RequestMethod.DELETE, entityName, object);
    }

    private async sendRequest(method: RequestMethod, entityName: entityNames, object: any) {
        const formattedObject = ApiClientHelper.format(object);
        return await fetch(this.getUrl(entityName), {
            method,
            body: JSON.stringify(formattedObject),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        }).then((response: Response) => {
            if (response.status >= 200 && response.status < 300) {
                return Promise.resolve();
            }
            const error: IRequestError = {
                errorCode: response.status,
                message: response.statusText,
            };
            return Promise.reject(error);
        }).catch((err) => {
            if (err.errorCode) {
                return Promise.reject(err);
            }
            const error: IRequestError = {
                errorCode: FetchStatusCode.CONNECTION_ERROR,
                message: 'Yhteysongelma',
            };
            return Promise.reject(error);
        });
    }

    private getUrl(entityName: entityNames) {
        return `${API_URL}/${entityName}`;
    }
}
