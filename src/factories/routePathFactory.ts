import { IRoutePath, INode } from '~/models';
import HashHelper from '~/util/hashHelper';
import IExternalRoutePath from '~/models/externals/IExternalRoutePath.ts';
import RoutePathLinkFactory, { IRoutePathLinkResult } from './routePathLinkFactory';
import QueryParsingHelper from './queryParsingHelper';

export interface IRoutePathResult {
    routePath: IRoutePath;
    nodes: INode[] | null;
}

class RoutePathFactory {
    public static createRoutePath = (
        routeId: string,
        externalRoutePath: IExternalRoutePath,
    ): IRoutePathResult => {
        const internalRoutePathId = HashHelper.getHashFromString(
            [
                routeId,
                externalRoutePath.suuvoimast,
                externalRoutePath.suusuunta,
            ].join('-'),
        ).toString();

        // TODO: refactor. createRoutePathLink should return IRoutePathLink
        const routePathLinkResult:IRoutePathLinkResult[] | null
        = externalRoutePath.externalRoutePathLinks
            .map((externalRoutePathLink: any) => {
                return RoutePathLinkFactory.createRoutePathLink(externalRoutePathLink);
            });

        const coordinates = externalRoutePath.geojson ?
            JSON.parse(externalRoutePath.geojson).coordinates : null;
        const positions = coordinates
            ? coordinates.map((coor: [number, number]) => [coor[1], coor[0]]) : null;

        const routePath : IRoutePath = {
            routeId,
            positions,
            routePathLinks: routePathLinkResult ? routePathLinkResult.map(res => res.link) : null,
            geoJson: externalRoutePath.geojson ? JSON.parse(externalRoutePath.geojson) : null,
            lineId: externalRoutePath.lintunnus,
            internalId: internalRoutePathId,
            routePathName: externalRoutePath.suunimi,
            routePathNameSw: externalRoutePath.suunimir,
            direction: externalRoutePath.suusuunta,
            startTime: new Date(externalRoutePath.suuvoimast),
            endTime: new Date(externalRoutePath.suuvoimviimpvm),
            lastModified: new Date(externalRoutePath.suuviimpvm),
            modifiedBy: externalRoutePath.suukuka,
            visible: false,
            originFi: externalRoutePath.suulahpaik,
            originSw: externalRoutePath.suulahpaikr,
            destinationFi: externalRoutePath.suupaapaik,
            destinationSw: externalRoutePath.suupaapaikr,
            routePathShortName: externalRoutePath.suunimilyh,
            routePathShortNameSw: externalRoutePath.suunimilyhr,
        };

        return {
            routePath,
            nodes: routePathLinkResult ? QueryParsingHelper.removeINodeDuplicates(
                routePathLinkResult
                    .reduce<INode[]>((flatList, node) => flatList.concat(node.nodes), []),
            ) : null,
        };
    }
}

export default RoutePathFactory;
