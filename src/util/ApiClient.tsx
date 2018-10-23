import entityNames from '~/enums/entityNames';

enum RequestMethod {
    POST= 'POST',
    PUT= 'PUT',
    DELETE= 'DELETE',
}

const API_URL = 'http://localhost:3040/';

export default class ApiClient {
    public async saveObject(entityName: entityNames, object: any) {
        return await this.sendRequest(RequestMethod.POST, entityName, object);
    }

    public async addObject(entityName: entityNames, object: any) {
        return await this.sendRequest(RequestMethod.PUT, entityName, object);
    }

    public async deleteObject(entityName: entityNames, object: any) {
        return await this.sendRequest(RequestMethod.DELETE, entityName, object);
    }

    private async sendRequest(method: RequestMethod, entityName: entityNames, object: any) {
        return await fetch(this.getUrl(entityName), {
            method,
            body: JSON.stringify(object),
        });
    }

    private getUrl(entityName: entityNames) {
        return `${API_URL}${entityName}`;
    }
}
