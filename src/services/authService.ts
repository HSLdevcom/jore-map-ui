import EndpointPath from '~/enums/endpointPath';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import ErrorStore from '~/stores/errorStore';
import LoginStore from '~/stores/loginStore';
import HttpUtils from '~/utils/HttpUtils';
import { getText } from '~/utils/textUtils';

interface IAuthorizationResponse {
    isOk: boolean;
    hasWriteAccess: boolean;
    errorTextKey?: string;
    email?: string;
}

class AuthService {
    public static async authenticate(onSuccess: () => void, onError: () => void) {
        const code = navigator.getQueryParam(QueryParams.code) as string;
        const isTesting = Boolean(navigator.getQueryParam(QueryParams.testing));
        let authorizationResponse: IAuthorizationResponse;
        try {
            authorizationResponse = (await HttpUtils.authorizeUsingCode({
                code,
                isTesting,
            })) as IAuthorizationResponse;
        } catch (error) {
            let errorResponse;
            try {
                errorResponse = JSON.parse(error.message) as IAuthorizationResponse;
            } catch (e) {
                ErrorStore.addError(
                    'Taustajärjestelmään ei saatu yhteyttä. Ongelman jatkuessa ota yhteyttä sovelluksen ylläpitäjään.'
                );
                onError();
                return;
            }
            authorizationResponse = {
                isOk: errorResponse.isOk,
                hasWriteAccess: errorResponse.hasWriteAccess,
            };
            if (errorResponse.errorTextKey) {
                let errorMessage;
                if (errorResponse.email) {
                    errorMessage = getText(errorResponse.errorTextKey, {
                        email: errorResponse.email,
                    });
                } else {
                    errorMessage = getText(errorResponse.errorTextKey);
                }
                ErrorStore.addError(errorMessage);
            }
        }
        LoginStore.setAuthenticationInfo(authorizationResponse);

        authorizationResponse.isOk ? onSuccess() : onError();
    }

    public static async logout() {
        await HttpUtils.postRequest(EndpointPath.LOGOUT, {});
        LoginStore.clear();
    }

    public static fetchIsSaveLockEnabled = async (): Promise<boolean> => {
        const response = await HttpUtils.getRequest(EndpointPath.SAVE_LOCK);
        return response.isSaveLockEnabled;
    };
}

export default AuthService;

export { IAuthorizationResponse };
