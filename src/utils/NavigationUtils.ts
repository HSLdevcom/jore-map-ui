import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';

class NavigationUtils {
    public static openLineView = ({
        lineId,
        unsavedChangesPromptMessage,
        shouldSkipUnsavedChangesPrompt
    }: {
        lineId: string;
        unsavedChangesPromptMessage?: string;
        shouldSkipUnsavedChangesPrompt?: boolean;
    }) => {
        const lineViewLink = routeBuilder
            .to(SubSites.line)
            .toTarget(':id', lineId)
            .toLink();
        navigator.goTo({
            unsavedChangesPromptMessage,
            shouldSkipUnsavedChangesPrompt,
            link: lineViewLink
        });
    };

    public static openRouteView = (routeId: string) => {
        const routeViewLink = routeBuilder
            .to(SubSites.routes)
            .append(QueryParams.routes, routeId)
            .toLink();
        navigator.goTo({ link: routeViewLink });
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
