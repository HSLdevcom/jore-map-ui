import ApiClient from '~/util/ApiClient';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import LoginStore from '~/stores/loginStore';
import endpoints from '~/enums/endpoints';

export interface IAuthorizationResponse {
    isOk: boolean;
    hasWriteAccess: boolean;
    email?: string;
}

class AuthService {
    public static async authenticate(onSuccess: () => void, onError: () => void) {
        const code = navigator.getQueryParam(QueryParams.code);
        const response = (await ApiClient.authorizeUsingCode(code)) as IAuthorizationResponse;
        LoginStore.setAuthenticationInfo(response);

        response.isOk ? onSuccess() : onError();
    }

    public static async logout() {
        // TODO: Implement full logout clearing session in backend
        // https://github.com/HSLdevcom/jore-map-ui/issues/669
        await ApiClient.postRequest(endpoints.LOGOUT, {});
        LoginStore.clear();
    }
}

export default AuthService;
