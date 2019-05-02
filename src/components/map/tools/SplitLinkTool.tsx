import * as React from 'react';
import ToolbarTool from '~/enums/toolbarTool';
import EventManager from '~/util/EventManager';
import ConfirmStore from '~/stores/confirmStore';
import NetworkStore, { MapLayer } from '~/stores/networkStore';
import NodeService from '~/services/nodeService';
import ErrorStore from '~/stores/errorStore';
import LinkStore from '~/stores/linkStore';
import NodeType from '~/enums/nodeType';
import NodeHelper from '~/util/nodeHelper';
import RouteBuilder from '~/routing/routeBuilder';
import navigator from '~/routing/navigator';
import SubSites from '~/routing/subSites';
import BaseTool from './BaseTool';
import * as s from './splitLinkTool.scss';

/**
 * Tool for splitting link
 */
class SplitLinkTool implements BaseTool {
    public toolType = ToolbarTool.SplitLink;
    public toolHelpHeader = 'Jakaa linkin solmulla';
    public toolHelpText = 'Valitse solmun millä haluat jakaa linkin';

    public activate() {
        NetworkStore.showMapLayer(MapLayer.node);
        NetworkStore.showMapLayer(MapLayer.nodeWithoutLink);
        EventManager.on('networkNodeClick', this.confirmNode);
    }

    public deactivate() {
        EventManager.off('networkNodeClick', this.confirmNode);
    }

    getConfirmContent = (message: string, itemList: { label: string, value: string }[]) => (
        <div className={s.confirmView}>
            <div className={s.confirmHeader}>
                {message}
            </div>
            {
                itemList.map(item => (
                    <div className={s.pair}>
                        <div className={s.label}>{item.label}</div>
                        <div>{item.value}</div>
                    </div>
                ))
            }
            <div className={s.note}>
                (Muutoksia eivät vielä tallenneta)
            </div>
        </div>
    )

    navigateToSplitLink = (nodeId: string) => {
        const link = LinkStore.link;
        if (!link) throw 'Unable to access which link should be splitted';
        const url = RouteBuilder.to(SubSites.splitLink)
            .clear().toTarget([
                link.startNode.id,
                link.endNode.id,
                link.transitType,
                nodeId,
            ].join(','))
            .toLink();
        navigator.goTo(url);
    }

    private confirmNode = async (clickEvent: CustomEvent) => {
        const nodeId = clickEvent.detail.nodeId;

        const node = await NodeService.fetchNode(nodeId);
        if (!node) {
            ErrorStore.addError(`Solmu soltunnuksella: ${nodeId} ei löytänyt`);
            return;
        }
        let confirmContent: React.ReactNode = null;
        if (node.type === NodeType.STOP) {
            confirmContent = this.getConfirmContent(
                'Oletko varma, että haluat jakaa linkin pysäkillä?',
                [
                    { label: 'Lyhyt ID', value: NodeHelper.getShortId(node) },
                    { label: 'Nimi', value: node.stop!.nameFi },
                    { label: 'Soltunnus', value: node.id },
                ],
            );
        } else {
            confirmContent = this.getConfirmContent(
                'Oletko varma, että haluat jakaa linkin solmulla?',
                [
                    { label: 'Tyyppi', value: NodeHelper.getNodeTypeName(node.type) },
                    { label: 'Soltunnus', value: node.id },
                ],
            );
        }
        ConfirmStore.openConfirm(confirmContent, () => {
            this.navigateToSplitLink(
                nodeId,
            );
        });
    }
}

export default SplitLinkTool;
