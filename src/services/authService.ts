class AuthService {
    public static authenticate(callback: Function) {
        // TODO: authentication call with username & password
        setTimeout(callback(true), 100); // fake async
    }
    public static signout = (callback: Function) => {
        // TODO: signout call
        setTimeout(callback(false), 100); // fake async
    }
}

export default AuthService;
