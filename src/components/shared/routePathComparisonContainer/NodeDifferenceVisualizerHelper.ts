import { cloneDeep } from 'lodash';
import RoutePathLinkFactory from '~/factories/routePathLinkFactory';
import { INode, IRoutePath, IRoutePathLink } from '~/models';
import { IRoutePathLinkRow } from './NodeDifferencesVisualizer';

/**
 * The algorithm behind this file is done with utilizing IComparableRoutePathLink's
 * We add an extra link to the end of given routePathLinks so that:
 *  - the underlying algorithm doesn't have to take into account checks of reaching the endNode
 *  - we get to add routePath.isStartNodeUsingBookSchedule and routePath.startNodeBookScheduleColumnNumber into
 *    routePathLink which is a very nice thing
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
    const rpLinks1: IComparableRoutePathLink[] = _getComparableRoutePathLinks(routePath1);
    const rpLinks2: IComparableRoutePathLink[] = _getComparableRoutePathLinks(routePath2);

    const rpLinkRows: IRoutePathLinkRow[] = [];
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
            // If both rpLinks are null, exit.
            break;
        }
        // If we no longer see rpLink1's (there are less rpLinks1 than rpLinks2), we draw rpLink2
        if (!rpLink1) {
            rpLinkRows.push({
                rpLink2,
                rpLink1: null,
                areNodesEqual: false,
            });
            bIndex += 1;
            continue;
        }
        // If we no longer see rpLink2's (there are less rpLinks2 than rpLinks1), we draw rpLink1
        if (!rpLink2) {
            rpLinkRows.push({
                rpLink1,
                rpLink2: null,
                areNodesEqual: false,
            });
            aIndex += 1;
            continue;
        }

        // If rpLinks are equal, print both
        if (_areLinksEqual(rpLink1, rpLink2)) {
            rpLinkRows.push({
                rpLink1,
                rpLink2,
                areNodesEqual: true,
            });
            aIndex += 1;
            bIndex += 1;
            // if rpLink1 exists in rpLinks2 and it's closer than rpLink2 index in rpLinks1, draw rpLink1
        } else if (rpLink1IndexInRpLinks2 < rpLink2IndexInRpLinks1) {
            rpLinkRows.push({
                rpLink1,
                rpLink2: null,
                areNodesEqual: false,
            });
            aIndex += 1;
            // if rpLink2 exists in rpLinks1 and it's closer than rpLink1 index in rpLinks2, draw rpLink2
        } else if (rpLink1IndexInRpLinks2 > rpLink2IndexInRpLinks1) {
            rpLinkRows.push({
                rpLink2,
                rpLink1: null,
                areNodesEqual: false,
            });
            bIndex += 1;
        } else {
            rpLinkRows.push({
                rpLink1,
                rpLink2,
                areNodesEqual: true, // Not true, can also be false.
            });
            aIndex += 1;
            bIndex += 1;
        }
    }
    return rpLinkRows;
};

// Add 1 extra routePathLink to the end which startNode is the current last element's endNode
const _getComparableRoutePathLinks = (routePath: IRoutePath): IComparableRoutePathLink[] => {
    const rpLinks = routePath.routePathLinks;
    let comparableRpLinks: IComparableRoutePathLink[] = rpLinks as IComparableRoutePathLink[];
    const lastRoutePathLink = comparableRpLinks[comparableRpLinks.length - 1];
    // These values doesnt matter since extraRpLink is only used for simplifier algorithm
    const extraRpLink: IComparableRoutePathLink = {
        id: RoutePathLinkFactory.getTemporaryRoutePathLinkId(),
        startNode: cloneDeep(lastRoutePathLink.endNode!),
        endNode: null,
        geometry: [],
        transitType: lastRoutePathLink.transitType,
        orderNumber: lastRoutePathLink.orderNumber + 1,
    };
    // Add missing properties from routePath
    extraRpLink.isStartNodeUsingBookSchedule = routePath.isStartNodeUsingBookSchedule;
    extraRpLink.startNodeBookScheduleColumnNumber = routePath.startNodeBookScheduleColumnNumber;
    comparableRpLinks = comparableRpLinks.concat([extraRpLink]);
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
