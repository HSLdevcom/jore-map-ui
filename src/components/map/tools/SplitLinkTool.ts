import ToolbarTool from '~/enums/toolbarTool';
import EventManager from '~/util/EventManager';
import ConfirmStore from '~/stores/confirmStore';
import NodeService from '~/services/nodeService';
import ErrorStore from '~/stores/errorStore';
import NodeType from '~/enums/nodeType';
import NodeHelper from '~/util/nodeHelper';
import BaseTool from './BaseTool';

/**
 * Tool for splitting link
 */
class SplitLinkTool implements BaseTool {
    public toolType = ToolbarTool.SplitLink;
    public activate() {
        EventManager.on('networkNodeClick', this.confirmNode);
    }
    public deactivate() {
        EventManager.off('networkNodeClick', this.confirmNode);
    }

    private confirmNode = async (clickEvent: CustomEvent) => {
        const nodeId = clickEvent.detail.nodeId;

        const node = await NodeService.fetchNode(nodeId);
        if (!node) {
            ErrorStore.addError(`Solmu soltunnuksella: ${nodeId} ei löytänyt`);
            return;
        }
        let confirmMessage = '';
        if (node.type === NodeType.STOP) {
            // tslint:disable-next-line:max-line-length
            confirmMessage = `Oletko varma, että haluat jakaa linkin pysäkillä (lyhyt ID: '${NodeHelper.getShortId(node)}', nimi: '${node.stop!.nameFi}')`;
        } else {
            // tslint:disable-next-line:max-line-length
            confirmMessage = `Oletko varma, että haluat jakaa linkin solmulla (tyyppi: ${NodeHelper.getNodeTypeName(node.type)}, soltunnus: '${node.id})'`;
        }

        ConfirmStore.openConfirm(confirmMessage, () => {});
    }
}

export default SplitLinkTool;
