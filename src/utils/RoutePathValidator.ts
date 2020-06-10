import NodeType from '~/enums/nodeType';
import { IRoutePathLink } from '~/models';

class RoutePathValidator {
    public static validateRoutePathLinkCoherency = (routePathLinks: IRoutePathLink[]) => {
        return routePathLinks.every(
            (rpLink, index) =>
                index === 0 || routePathLinks[index - 1].endNode.id === rpLink.startNode.id
        );
    };

    // validate that stop can't appear twice (at least one must be set as disabled)
    public static getStopIdThatAppearsTwice = (routePathLinks: IRoutePathLink[]): string | null => {
        interface IActiveStopMap {
            [name: string]: string;
        }
        let stopIdAppearingTwice = null;
        const seenStopIds: IActiveStopMap = {};

        routePathLinks.forEach((rpLink, index) => {
            const startNode = rpLink.startNode;
            if (startNode.type === NodeType.STOP && rpLink.startNodeType !== 'E') {
                if (!seenStopIds[startNode.id]) {
                    seenStopIds[startNode.id] = startNode.id;
                } else {
                    stopIdAppearingTwice = startNode.id;
                }
            }
            if (index === routePathLinks.length - 1) {
            }
        });

        // Validate last node
        const endLink = routePathLinks[routePathLinks.length - 1];
        const endNode = endLink.endNode;
        if (endNode.type === NodeType.STOP && seenStopIds[endNode.id]) {
            stopIdAppearingTwice = endNode.id;
        }
        return stopIdAppearingTwice;
    };

    public static isRoutePathStartNodeTheSameAsEndNode = (routePathLinks: IRoutePathLink[]) => {
        const firstNode = routePathLinks[0].startNode;
        const lastNode = routePathLinks[routePathLinks.length - 1].endNode;

        return firstNode.id === lastNode.id;
    };

    // routePath can't have the same start / end node
}

export default RoutePathValidator;
