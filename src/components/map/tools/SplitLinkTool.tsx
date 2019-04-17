import * as React from 'react';
import ToolbarTool from '~/enums/toolbarTool';
import EventManager from '~/util/EventManager';
import ConfirmStore from '~/stores/confirmStore';
import NetworkStore, { MapLayer } from '~/stores/networkStore';
import NodeService from '~/services/nodeService';
import ErrorStore from '~/stores/errorStore';
import NodeType from '~/enums/nodeType';
import NodeHelper from '~/util/nodeHelper';
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
        ConfirmStore.openConfirm(confirmContent, () => {});
    }
}

export default SplitLinkTool;
