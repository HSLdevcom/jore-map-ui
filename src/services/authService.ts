import ApiClient from '~/util/ApiClient';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import LoginStore from '~/stores/loginStore';

export interface IAuthorizationResponse {
    isOk: boolean;
    hasWriteAccess: boolean;
    email?: string;
}

class AuthService {
    public static async authenticate(onSuccess: () => void, onError: () => void) {
        const code = navigator.getQueryParam(QueryParams.code);
        const apiClient = new ApiClient();
        const response = (await apiClient.authorizeUsingCode(code)) as IAuthorizationResponse;
        LoginStore.setAuthenticationInfo(response);

        response.isOk ? onSuccess() : onError();
    }
}

export default AuthService;
