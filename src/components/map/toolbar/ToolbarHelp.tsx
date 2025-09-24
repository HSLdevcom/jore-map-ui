import classnames from 'classnames'
import { observer } from 'mobx-react'
import React from 'react'
import { Button } from '~/components/controls'
import ButtonType from '~/enums/buttonType'
import ToolbarToolType from '~/enums/toolbarToolType'
import RoutePathCopySegmentStore, { setNodeType } from '~/stores/routePathCopySegmentStore'
import ToolbarStore from '~/stores/toolbarStore'
import * as s from './toolbarHelp.scss'

interface IToolbarHelpProps {}

const ToolbarHelp = observer((props: IToolbarHelpProps) => {
  const selectedTool = ToolbarStore.selectedTool
  if (!selectedTool || !selectedTool.toolHelpHeader) return null
  const toolPhase = ToolbarStore.toolPhase
  const toolHelpPhasesMap = selectedTool.toolHelpPhasesMap?.[toolPhase!]
  return (
    <div className={s.toolbarHelp}>
      {renderToolbarHelpContent(
        selectedTool.toolHelpHeader,
        toolHelpPhasesMap?.phaseTopic,
        toolHelpPhasesMap?.phaseHelpText
      )}
      {selectedTool.toolType === ToolbarToolType.CopyRoutePathSegment &&
        renderCopyRoutePathToolToolHelpButtons()}
    </div>
  )
})

const renderToolbarHelpContent = (
  toolHelpHeader: string,
  phaseTopic?: string,
  phaseHelpText?: string
) => {
  const shouldBlinkToolHelp = ToolbarStore.shouldBlinkToolHelp
  return (
    <div>
      <div className={s.toolbarHelpHeader}>{toolHelpHeader}</div>
      {phaseTopic && <div className={s.phaseTopic}>{phaseTopic}</div>}
      {phaseHelpText && (
        <div
          className={classnames(s.phaseHelpText, shouldBlinkToolHelp ? s.blink : undefined)}
        >
          {phaseHelpText}
        </div>
      )}
    </div>
  )
}

const renderCopyRoutePathToolToolHelpButtons = () => {
  const setSetNodeType = (setNodeType: setNodeType) => () => {
    RoutePathCopySegmentStore.setSetNodeType(setNodeType)
  }
  const setNodeType = RoutePathCopySegmentStore.setNodeType

  return (
    <div className={s.copyRoutePathToolButtons}>
      <Button
        onClick={setSetNodeType('startNode')}
        type={ButtonType.SQUARE}
        className={setNodeType === 'startNode' ? s.startButtonSelected : s.startButton}
      >
        Alkusolmu
      </Button>
      <Button
        onClick={setSetNodeType('endNode')}
        type={ButtonType.SQUARE}
        className={setNodeType === 'endNode' ? s.endButtonSelected : s.endButton}
      >
        Loppusolmu
      </Button>
    </div>
  )
}

export default ToolbarHelp
