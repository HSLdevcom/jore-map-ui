import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';

class NavigationUtils {
    public static openLineView = ({ lineId }: { lineId: string }) => {
        const lineViewLink = routeBuilder
            .to(SubSites.line)
            .toTarget(':id', lineId)
            .toLink();
        navigator.goTo({
            link: lineViewLink
        });
    };

    public static openRouteView = ({
        routeId,
        queryValues
    }: {
        routeId: string;
        queryValues?: any;
    }) => {
        const routeViewLink = routeBuilder
            .to(SubSites.routes, queryValues)
            .append(QueryParams.routes, routeId)
            .toLink();
        navigator.goTo({
            link: routeViewLink
        });
    };

    public static openNodeView = ({
        nodeId,
        unsavedChangesPromptMessage,
        shouldSkipUnsavedChangesPrompt
    }: {
        nodeId: string;
        unsavedChangesPromptMessage?: string;
        shouldSkipUnsavedChangesPrompt?: boolean;
    }) => {
        const nodeViewLink = routeBuilder
            .to(SubSites.node)
            .toTarget(':id', nodeId)
            .toLink();
        navigator.goTo({
            unsavedChangesPromptMessage,
            shouldSkipUnsavedChangesPrompt,
            link: nodeViewLink
        });
    };
}
export default NavigationUtils;
