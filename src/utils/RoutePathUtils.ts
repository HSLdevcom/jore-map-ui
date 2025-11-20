import NodeType from '~/enums/nodeType';
import { IRoutePath, IRoutePathLink } from '~/models';

class RoutePathUtils {
    public static validateRoutePathLinkCoherency = (routePathLinks: IRoutePathLink[]) => {
        return routePathLinks.every(
            (rpLink, index) =>
                index === 0 || routePathLinks[index - 1].endNode.id === rpLink.startNode.id
        );
    };

    // Split routePathLinks into sub lists with coherent routePathLinks
    public static getCoherentRoutePathLinksList = (
        routePathLinks: IRoutePathLink[]
    ): IRoutePathLink[][] => {
        const coherentRoutePathLinksList: IRoutePathLink[][] = [];
        let index = 0;
        routePathLinks.forEach((currentRpLink) => {
            const currentList = coherentRoutePathLinksList[index];
            if (!currentList && index === 0) {
                coherentRoutePathLinksList[index] = [currentRpLink];
                return;
            }
            const lastRpLink = currentList[currentList.length - 1];
            if (lastRpLink.endNode.id === currentRpLink.startNode.id) {
                currentList.push(currentRpLink);
            } else {
                const newList = [currentRpLink];
                coherentRoutePathLinksList.push(newList);
                index += 1;
            }
        });
        return coherentRoutePathLinksList;
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

    public static getAreRoutePathsEqual = (rp1: IRoutePath, rp2: IRoutePath) => {
        return (
            rp1.lineId === rp2.lineId &&
            rp1.routeId === rp2.routeId &&
            rp1.direction === rp2.direction &&
            rp1.startDate.toDateString() === rp2.startDate.toDateString()
        );
    };
}

export default RoutePathUtils;
