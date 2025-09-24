import NodeType from '~/enums/nodeType'
import ToolbarToolType from '~/enums/toolbarToolType'
import EventListener from '~/helpers/EventListener'
import navigator from '~/routing/navigator'
import RouteBuilder from '~/routing/routeBuilder'
import SubSites from '~/routing/subSites'
import NodeService from '~/services/nodeService'
import ConfirmStore from '~/stores/confirmStore'
import ErrorStore from '~/stores/errorStore'
import LinkStore from '~/stores/linkStore'
import NetworkStore, { MapLayer } from '~/stores/networkStore'
import ToolbarStore from '~/stores/toolbarStore'
import NodeUtils from '~/utils/NodeUtils'
import BaseTool from './BaseTool'

type toolPhase = 'selectNodeToSplitLinkWith'

class SplitLinkTool implements BaseTool {
  public toolType = ToolbarToolType.SplitLink
  public toolHelpHeader = 'Jaa linkki solmulla'
  public toolHelpPhasesMap = {
    selectNodeToSplitLinkWith: {
      phaseHelpText: 'Valitse kartalta solmu, jolla haluat jakaa avattuna olevan linkin.',
    },
  }

  public activate = () => {
    NetworkStore.showMapLayer(MapLayer.node)
    NetworkStore.showMapLayer(MapLayer.unusedNode)
    EventListener.on('networkNodeClick', this.openNodeConfirm)
    this.setToolPhase('selectNodeToSplitLinkWith')
  }

  public deactivate = () => {
    this.setToolPhase(null)
    EventListener.off('networkNodeClick', this.openNodeConfirm)
  }

  public getToolPhase = () => {
    return ToolbarStore.toolPhase
  }

  public setToolPhase = (toolPhase: toolPhase | null) => {
    ToolbarStore.setToolPhase(toolPhase)
  }

  navigateToSplitLink = (nodeId: string) => {
    const link = LinkStore.link
    if (!link) throw 'Valittua linkkiä ei löytynyt.'
    const splitLinkViewLink = RouteBuilder.to(SubSites.splitLink)
      .toTarget(
        ':id',
        [link.startNode.id, link.endNode.id, link.transitType, nodeId].join(',')
      )
      .toLink()
    navigator.goTo({ link: splitLinkViewLink })
  }

  private openNodeConfirm = async (clickEvent: CustomEvent) => {
    const nodeId = clickEvent.detail.nodeId

    const node = await NodeService.fetchNode(nodeId)
    if (!node) {
      ErrorStore.addError(`Solmua (soltunnus ${nodeId}) ei löytynyt`)
      return
    }
    let confirmData: Object = {}
    if (node.type === NodeType.STOP) {
      confirmData = {
        message: 'Oletko varma, että haluat jakaa linkin pysäkillä?',
        itemList: [
          { label: 'Lyhyt ID', value: NodeUtils.getShortId(node) },
          { label: 'Nimi', value: node.stop!.nameFi },
          { label: 'Soltunnus', value: node.id },
        ],
      }
    } else {
      confirmData = {
        message: 'Oletko varma, että haluat jakaa linkin solmulla?',
        itemList: [
          {
            label: 'Tyyppi',
            value: NodeUtils.getNodeTypeName(node.type),
          },
          { label: 'Soltunnus', value: node.id },
        ],
      }
    }
    ConfirmStore.openConfirm({
      confirmData,
      confirmComponentName: 'splitConfirm',
      onConfirm: () => {
        ToolbarStore.selectTool(null)
        this.navigateToSplitLink(nodeId)
      },
    })
  }
}

export default SplitLinkTool
