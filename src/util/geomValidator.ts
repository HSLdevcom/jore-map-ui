import { IRoutePathLink } from '~/models';

const validateRoutePathLinks = (rpLinks: IRoutePathLink[]) => {
    if (rpLinks.length === 0) return false;
    return rpLinks.every((rpLink, index) => (
        index === 0 || rpLinks[index - 1].endNode.id === rpLink.startNode.id));
};

export {
    validateRoutePathLinks,
};
