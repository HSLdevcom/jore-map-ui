import { cloneDeep } from 'lodash';
import { INode, IRoutePath, IRoutePathLink } from '~/models';
import { IRoutePathLinkRow } from './NodeDifferencesVisualizer';

/**
 * The algorithm behind this file is done with utilizing IComparableRoutePathLink's
 * We add an extra link to the end of given routePathLinks so that the underlying
 * algorithm doesn't have to take into account checks of reaching the endNode
 *
 * So, only the last IComparableRoutePathLink will have endNode marked as null.
 *
 **/
interface IComparableRoutePathLink extends Omit<IRoutePathLink, 'endNode'> {
    endNode: INode | null;
}

// Create a simple IRoutePathLinkRow[] list so that the UI component can easilly render it
const getRpLinkRows = ({
    routePath1,
    routePath2,
}: {
    routePath1: IRoutePath;
    routePath2: IRoutePath;
}): IRoutePathLinkRow[] => {
    const rpLinks1: IComparableRoutePathLink[] = _getComparableRoutePathLinks(
        routePath1.routePathLinks
    );
    const rpLinks2: IComparableRoutePathLink[] = _getComparableRoutePathLinks(
        routePath2.routePathLinks
    );

    const nodeRows: IRoutePathLinkRow[] = [];
    let aIndex = 0;
    let bIndex = 0;
    // Exit loop if it doesn't end, better than using while(true)
    // Expecting that no routePath will ever be more than 10000 links long
    while (aIndex < 10000 && bIndex < 10000) {
        const rpLink1: IComparableRoutePathLink | null = rpLinks1[aIndex];
        const rpLink2: IComparableRoutePathLink | null = rpLinks2[bIndex];

        const rpLink1IndexInRpLinks2 = _getRpLinkIndexInGivenRpLinks({
            startIndex: bIndex,
            sourceRpLink: rpLink1,
            targetRpLinks: rpLinks2,
        });
        const rpLink2IndexInRpLinks1 = _getRpLinkIndexInGivenRpLinks({
            startIndex: aIndex,
            sourceRpLink: rpLink2,
            targetRpLinks: rpLinks1,
        });
        if (!rpLink1 && !rpLink2) {
            // If both nodes are null, exit.
            break;
        }
        // If we no longer see node1's (there are less rpLinks1 than rpLinks2), we draw node2
        if (!rpLink1) {
            nodeRows.push({
                rpLink2,
                rpLink1: null,
                areNodesEqual: false,
            });
            bIndex += 1;
            continue;
        }
        // If we no longer see node2's (there are less rpLinks2 than rpLinks1), we draw node1
        if (!rpLink2) {
            nodeRows.push({
                rpLink1,
                rpLink2: null,
                areNodesEqual: false,
            });
            aIndex += 1;
            continue;
        }

        // If links are equal, print both
        if (_areLinksEqual(rpLink1, rpLink2)) {
            nodeRows.push({
                rpLink1,
                rpLink2,
                areNodesEqual: true,
            });
            aIndex += 1;
            bIndex += 1;
            // if rpLink1 exists in rpLinks2 and it's closer than rpLink2 index in rpLinks1, draw rpLink1
        } else if (rpLink1IndexInRpLinks2 < rpLink2IndexInRpLinks1) {
            nodeRows.push({
                rpLink1,
                rpLink2: null,
                areNodesEqual: false,
            });
            aIndex += 1;
            // if rpLink2 exists in rpLinks1 and it's closer than rpLink1 index in rpLinks2, draw rpLink2
        } else if (rpLink1IndexInRpLinks2 > rpLink2IndexInRpLinks1) {
            nodeRows.push({
                rpLink2,
                rpLink1: null,
                areNodesEqual: false,
            });
            bIndex += 1;
        } else {
            nodeRows.push({
                rpLink1,
                rpLink2,
                areNodesEqual: true, // Not true, can also be false.
            });
            aIndex += 1;
            bIndex += 1;
        }
    }
    return nodeRows;
};

// Add 1 extra routePathLink to the end which startNode is the current last element's endNode
const _getComparableRoutePathLinks = (rpLinks: IRoutePathLink[]): IComparableRoutePathLink[] => {
    let comparableRpLinks: IComparableRoutePathLink[] = rpLinks as IComparableRoutePathLink[];
    const extraElement = cloneDeep(comparableRpLinks[comparableRpLinks.length - 1]);
    extraElement.startNode = { ...extraElement.endNode! };
    extraElement.endNode = null;
    comparableRpLinks = comparableRpLinks.concat([extraElement]);
    return comparableRpLinks;
};

const _getRpLinkIndexInGivenRpLinks = ({
    startIndex,
    sourceRpLink,
    targetRpLinks,
}: {
    startIndex: number;
    sourceRpLink: IComparableRoutePathLink;
    targetRpLinks: IComparableRoutePathLink[];
}): number => {
    for (let i = startIndex; i < targetRpLinks.length; i += 1) {
        const currentRpLink = targetRpLinks[i];
        if (_areLinksEqual(sourceRpLink, currentRpLink)) {
            return i;
        }
    }
    return -1;
};

const _areLinksEqual = (
    rpLink1?: IComparableRoutePathLink | null,
    rpLink2?: IComparableRoutePathLink | null
): boolean => {
    if (!rpLink1 || !rpLink2) {
        return false;
    }
    if (rpLink1.endNode === null || rpLink2.endNode === null) {
        return rpLink1.startNode.id === rpLink2.startNode.id;
    }
    return (
        rpLink1.startNode.id === rpLink2.startNode.id && rpLink1.endNode.id === rpLink2.endNode.id
    );
};

export { getRpLinkRows };

export { IComparableRoutePathLink };
