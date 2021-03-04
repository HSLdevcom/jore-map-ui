import { forOwn, isEqual, omit } from 'lodash';
import ToolbarToolType from '~/enums/toolbarToolType';
import { IRoutePath, IRoutePathLink } from '~/models';
import { RoutePathLinkMassEditStore } from '~/stores/routePathLinkMassEditStore';
import { RoutePathStore } from '~/stores/routePathStore';
import { ToolbarStore } from '~/stores/toolbarStore';

const updateDisabledRoutePathToolStatus = ({
    toolbarStore,
    routePathStore,
    routePathLinkMassEditStore,
}: {
    toolbarStore: ToolbarStore;
    routePathStore: RoutePathStore;
    routePathLinkMassEditStore: RoutePathLinkMassEditStore;
}) => {
    if (routePathStore.isCompareRoutePathsContainerVisible) {
        toolbarStore.setDisabledTools([
            ToolbarToolType.ExtendRoutePath,
            ToolbarToolType.RemoveRoutePathLink,
            ToolbarToolType.CopyRoutePathSegment,
        ]);
        toolbarStore.setUndoButtonsDisabled(true);
        return;
    }
    let disabledTools: ToolbarToolType[] = [];
    const isExtendRoutePathToolDisabled =
        routePathLinkMassEditStore.selectedMassEditRoutePathLinks.length > 0;
    const isRemoveRoutePathLinkToolDisabled =
        routePathLinkMassEditStore.selectedMassEditRoutePathLinks.length > 0;
    const isCopyRoutePathSegmentToolDisabled =
        (routePathStore.routePath && routePathStore.routePath.routePathLinks.length === 0) ||
        routePathLinkMassEditStore.selectedMassEditRoutePathLinks.length > 0;
    if (isExtendRoutePathToolDisabled) {
        disabledTools = disabledTools.concat([ToolbarToolType.ExtendRoutePath]);
    }
    if (isRemoveRoutePathLinkToolDisabled) {
        disabledTools = disabledTools.concat([ToolbarToolType.RemoveRoutePathLink]);
    }
    if (isCopyRoutePathSegmentToolDisabled) {
        disabledTools = disabledTools.concat([ToolbarToolType.CopyRoutePathSegment]);
    }

    toolbarStore.setDisabledTools(disabledTools);

    const areUndoToolsDisabled =
        routePathLinkMassEditStore.selectedMassEditRoutePathLinks.length > 0;
    toolbarStore.setUndoButtonsDisabled(areUndoToolsDisabled);
};

/**
 * Need to do a custom rp comparison because isEqual from lodash is too "brutal",
 * it considers e.g. '' vs null or undefined vs null as different values
 * (as they really are, but we want them to be equal)
 */
const compareRoutePaths = (rp1: IRoutePath, rp2: IRoutePath): boolean => {
    const rp1ToCompare = omit(rp1, ['routePathLinks']);
    const rp2ToCompare = omit(rp2, ['routePathLinks']);
    let areRoutePathsEqual = true;
    forOwn(rp1ToCompare, (a: any, property: string) => {
        const b = rp2ToCompare[property];
        if ((!a || a === '') && (!b || b === '')) {
            return;
        }
        if (!isEqual(a, b)) {
            areRoutePathsEqual = false;
        }
    });
    return areRoutePathsEqual;
};

/**
 * Need to do a custom rp link comparison because isEqual from lodash is too "brutal",
 * it considers e.g. '' vs null or undefined vs null as different values
 * (as they really are, but we want them to be equal)
 *
 * Also we want to leave internal ids out of the checks.
 */
const compareRoutePathLinks = (rpLink1: IRoutePathLink, rpLink2: IRoutePathLink): boolean => {
    let areRoutePathLinksEqual = true;
    forOwn(
        omit(rpLink1, ['id', 'modifiedOn', 'modifiedBy', 'startNode', 'endNode']),
        (a: any, property: string) => {
            const b = rpLink2[property];
            if ((!a || a === '') && (!b || b === '')) {
                return;
            }
            if (!isEqual(a, b)) {
                areRoutePathLinksEqual = false;
            }
        }
    );
    if (!areRoutePathLinksEqual) {
        return false;
    }

    const isStartNodeEqual = rpLink1.startNode.id === rpLink2.startNode.id;
    const isEndNodeEqual = rpLink1.endNode.id === rpLink2.endNode.id;

    if (!isStartNodeEqual || !isEndNodeEqual) {
        return false;
    }

    return areRoutePathLinksEqual;
};

export { compareRoutePaths, updateDisabledRoutePathToolStatus, compareRoutePathLinks };
