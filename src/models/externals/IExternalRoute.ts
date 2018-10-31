import IExternalRoutePathNode from './IExternalRoutePath';

export default interface IExternalRoute {
    lintunnus: string;
    reikuka: string;
    reinimi: string;
    reinimilyh: string;
    reinimilyhr: string;
    reinimir: string;
    reitinsuuntasByReitunnus: {
        nodes: IExternalRoutePathNode[],
    };
    reitunnus: string;
    reiviimpvm: string;
}
