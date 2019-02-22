import ApiClient from '~/util/ApiClient';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import LoginStore from '~/stores/loginStore';

interface IAuthorizationResponse {
    isOk: boolean;
    email?: string;
}

class AuthService {
    public static async authenticate(onSuccess: () => void, onError: () => void) {
        const code = navigator.getQueryParam(QueryParams.code);
        const apiClient = new ApiClient();
        const response = (await apiClient.authorizeUsingCode(code)) as IAuthorizationResponse;

        if (response.isOk) {
            LoginStore.setIsAuthenticated(true, response.email!);
            onSuccess();
        } else {
            LoginStore.setIsAuthenticated(false);
            onError();
        }
    }
}

export default AuthService;
