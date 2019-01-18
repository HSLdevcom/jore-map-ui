import { IRoutePathLink } from '~/models';

const validateRoutePathLinks = (rpLinks: IRoutePathLink[]) => {
    let valid = true;
    rpLinks.forEach((rpLink, index) => {
        if (index !== 0) {
            const previousLink = rpLinks[index - 1];
            if (previousLink.endNode.id !== rpLink.startNode.id) {
                valid = false;
            }
        }
    });
    return valid;
};

export {
    validateRoutePathLinks,
};
