import ApiClient from '~/util/ApiClient';

class AuthService {
    public grantAuthorization = async (code: string, onSuccess: () => void) => {
        const client = new ApiClient();
        const response = await client.authorizeGrant(code);
        console.log(response);
        onSuccess();
    }
}

export default new AuthService();
