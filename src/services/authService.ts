import ApiClient from '~/util/ApiClient';

class AuthService {
    public grantAuthorization = async (code: string, onSuccess: () => void) => {
        const client = new ApiClient();
        await client.authorizeGrant(code);
        onSuccess();
    }
}

export default new AuthService();
