import ToolbarToolType from '~/enums/toolbarToolType';
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

export { updateDisabledRoutePathToolStatus };
