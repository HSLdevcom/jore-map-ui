import SplitConfirmContent from '~/components/sidebar/splitLinkView/SplitConfirmContent';
import NodeType from '~/enums/nodeType';
import ToolbarTool from '~/enums/toolbarTool';
import navigator from '~/routing/navigator';
import RouteBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import NodeService from '~/services/nodeService';
import ConfirmStore from '~/stores/confirmStore';
import ErrorStore from '~/stores/errorStore';
import LinkStore from '~/stores/linkStore';
import NetworkStore, { MapLayer } from '~/stores/networkStore';
import ToolbarStore from '~/stores/toolbarStore';
import EventManager from '~/util/EventManager';
import NodeHelper from '~/util/NodeHelper';
import BaseTool from './BaseTool';

class SplitLinkTool implements BaseTool {
    public toolType = ToolbarTool.SplitLink;
    public toolHelpHeader = 'Jaa linkki solmulla';
    public toolHelpText = 'Valitse kartalta solmu, jolla haluat jakaa avattuna olevan linkin.';

    public activate() {
        NetworkStore.showMapLayer(MapLayer.node);
        NetworkStore.showMapLayer(MapLayer.nodeWithoutLink);
        EventManager.on('networkNodeClick', this.openNodeConfirm);
    }

    public deactivate() {
        EventManager.off('networkNodeClick', this.openNodeConfirm);
    }

    navigateToSplitLink = (nodeId: string) => {
        const link = LinkStore.link;
        if (!link) throw 'Valittua linkkiä ei löytynyt.';
        const url = RouteBuilder.to(SubSites.splitLink)
            .toTarget(
                ':id',
                [link.startNode.id, link.endNode.id, link.transitType, nodeId].join(',')
            )
            .toLink();
        navigator.goTo(url);
    };

    private openNodeConfirm = async (clickEvent: CustomEvent) => {
        const nodeId = clickEvent.detail.nodeId;

        const node = await NodeService.fetchNode(nodeId);
        if (!node) {
            ErrorStore.addError(`Solmua (soltunnus ${nodeId}) ei löytynyt`);
            return;
        }
        let confirmContent: React.ReactNode = null;
        if (node.type === NodeType.STOP) {
            confirmContent = SplitConfirmContent({
                message: 'Oletko varma, että haluat jakaa linkin pysäkillä?',
                itemList: [
                    { label: 'Lyhyt ID', value: NodeHelper.getShortId(node) },
                    { label: 'Nimi', value: node.stop!.nameFi },
                    { label: 'Soltunnus', value: node.id }
                ]
            });
        } else {
            confirmContent = SplitConfirmContent({
                message: 'Oletko varma, että haluat jakaa linkin solmulla?',
                itemList: [
                    {
                        label: 'Tyyppi',
                        value: NodeHelper.getNodeTypeName(node.type)
                    },
                    { label: 'Soltunnus', value: node.id }
                ]
            });
        }
        ConfirmStore.openConfirm({
            content: confirmContent,
            onConfirm: () => {
                ToolbarStore.selectTool(null);
                this.navigateToSplitLink(nodeId);
            }
        });
    };
}

export default SplitLinkTool;
