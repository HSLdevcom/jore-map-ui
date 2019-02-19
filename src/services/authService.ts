class AuthService {
    public static authenticate(cb: any) {
        // TODO: authentication call with username & password
        setTimeout(cb(true), 100); // fake async
    }
    public static signout = (cb: any) => {
        // TODO: signout call
        setTimeout(cb(false), 100); // fake async
    }
}

export default AuthService;
