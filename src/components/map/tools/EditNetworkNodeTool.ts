import NetworkStore, { NodeSize } from '~/stores/networkStore';
import NotificationStore from '~/stores/notificationStore';
import EditNetworkStore from '~/stores/editNetworkStore';
import LinkService from '~/services/linkService';
import NodeService from '~/services/nodeService';
import ToolbarTool from '~/enums/toolbarTool';
import ILink from '~/models/ILink';
import NotificationType from '~/enums/notificationType';
import BaseTool from './BaseTool';

/**
 * Tool for editing selected network node's 3 type of locations and links that have selected node
 * as either start or end node
 */
export default class EditNetworkNodeTool implements BaseTool {
    public toolType = ToolbarTool.EditNetworkNode;

    public activate() {
        NetworkStore.setNodeSize(NodeSize.large);
    }
    public deactivate() {
        NetworkStore.setNodeSize(NodeSize.normal);
        EditNetworkStore.clear();
    }

    public onNetworkNodeClick = async (clickEvent: any) => {
        const properties =  clickEvent.sourceTarget.properties;
        const {
            transittypes: transitTypeCodesString,
            soltunnus: nodeId,
        } = properties;
        const node = await NodeService.fetchNode(nodeId);
        if (!node) {
            NotificationStore.addNotification({
                message: `Solmua (soltunnus: ${nodeId}) ei löytynyt.`,
                type: NotificationType.ERROR,
            });
            return;
        }
        EditNetworkStore.setNode(node);

        if (!transitTypeCodesString) {
            this.showWarning(nodeId, transitTypeCodesString);
            return;
        }

        const links = await this.fetchLinks(nodeId, transitTypeCodesString);
        if (links.length === 0) {
            this.showWarning(nodeId, transitTypeCodesString);
            return;
        }
        EditNetworkStore.setLinks(links);
    }

    private showWarning(nodeId: string, transitTypeCodesString: string) {
        NotificationStore.addNotification({
            message: `Tästä solmusta (soltunnus: ${nodeId}) alkavia linkkejä ei löytynyt. TransitType koodi(t): ${transitTypeCodesString}`, // tslint:disable max-line-length
            type: NotificationType.WARNING,
        });
        return;
    }

    private async fetchLinks(nodeId: string, transitTypeCodesString: string): Promise<ILink[]> {
        const transitTypeCodes = transitTypeCodesString.split(',');
        return await Promise.all(transitTypeCodes.map((transitTypeCode: string) =>
            LinkService.fetchLinksByStartNodeAndEndNode(nodeId, transitTypeCode)))
        .then((linksResult: ILink[][]) => {
            return linksResult.reduce((a, b) =>
                a.concat(b),
            );
        });
    }
}
