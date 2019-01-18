import { IRoutePathLink } from '~/models';

const validateRoutePathLinks = (rpLinks: IRoutePathLink[]) => {
    return rpLinks.every((rpLink, index) => (
        index === 0 || rpLinks[index - 1].endNode.id === rpLink.startNode.id));
};

export {
    validateRoutePathLinks,
};
