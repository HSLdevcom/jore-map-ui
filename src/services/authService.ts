import ApiClient from '~/util/ApiClient';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import LoginStore from '~/stores/loginStore';

interface IAuthorizationResponse {
    ok: boolean;
    email?: string;
}

class AuthService {
    public static async authenticate(onSuccess: () => void, onError: () => void) {
        const code = navigator.getQueryParam(QueryParams.code);
        const client = new ApiClient();
        const response = (await client.authorizeGrant(code)) as IAuthorizationResponse;

        if (response.ok) {
            LoginStore.setIsAuthenticated(true, response.email!);
            onSuccess();
        } else {
            onError();
        }
    }
}

export default AuthService;
