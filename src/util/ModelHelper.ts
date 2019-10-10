import { INode, IRoutePath } from '~/models';

const loopRoutePathNodes = (
    routePath: IRoutePath,
    callback: (node: INode, index: number) => void
) => {
    const routePathLinks = routePath.routePathLinks;
    routePathLinks.forEach((rpLink, index) => {
        if (index === 0 || routePathLinks[index - 1].endNode.id !== rpLink.startNode.id) {
            callback(rpLink.startNode, index);
        }
        callback(rpLink.endNode, index);
    });
};

export default {
    loopRoutePathNodes
};
