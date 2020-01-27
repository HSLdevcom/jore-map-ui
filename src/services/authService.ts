import EndpointPath from '~/enums/endpointPath';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import ErrorStore from '~/stores/errorStore';
import LoginStore from '~/stores/loginStore';
import CodeListUtils from '~/utils/CodeListUtils';
import HttpUtils from '~/utils/HttpUtils';

export interface IAuthorizationResponse {
    isOk: boolean;
    hasWriteAccess: boolean;
    errorTextKey?: string;
    email?: string;
}

class AuthService {
    public static async authenticate(onSuccess: () => void, onError: () => void) {
        const code = navigator.getQueryParam(QueryParams.code);
        const isTesting = navigator.getQueryParam(QueryParams.testing);
        let authorizationResponse: IAuthorizationResponse;
        try {
            authorizationResponse = (await HttpUtils.authorizeUsingCode({
                code,
                isTesting
            })) as IAuthorizationResponse;
        } catch (error) {
            const errorResponse = JSON.parse(error.message) as IAuthorizationResponse;
            authorizationResponse = {
                isOk: errorResponse.isOk,
                hasWriteAccess: errorResponse.hasWriteAccess
            };
            if (errorResponse.errorTextKey) {
                let errorMessage;
                if (errorResponse.email) {
                    errorMessage = CodeListUtils.getText(errorResponse.errorTextKey, {
                        email: errorResponse.email
                    });
                } else {
                    errorMessage = CodeListUtils.getText(errorResponse.errorTextKey);
                }
                ErrorStore.addError(errorMessage);
            }
        }
        LoginStore.setAuthenticationInfo(authorizationResponse);

        authorizationResponse.isOk ? onSuccess() : onError();
    }

    public static async logout() {
        // TODO: Implement full logout clearing session in backend
        // https://github.com/HSLdevcom/jore-map-ui/issues/669
        await HttpUtils.postRequest(EndpointPath.LOGOUT, {});
        LoginStore.clear();
    }
}

export default AuthService;
