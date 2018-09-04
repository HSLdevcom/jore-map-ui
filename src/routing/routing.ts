export interface Url {
    location: string;
}

const routing = {
    home: <Url>{
        location: '/',
    },
    routes: <Url>{
        location: '/routes/',
    },
};

export default routing;
