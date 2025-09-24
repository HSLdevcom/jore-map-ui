import { observer } from 'mobx-react'
import React from 'react'
import { FiScissors } from 'react-icons/fi'
import ToolbarToolType from '~/enums/toolbarToolType'
import ToolbarStore from '~/stores/toolbarStore'
import MapControlButton from '../mapControls/MapControlButton'

@observer
class ToolbarLinkButtons extends React.Component {
  private selectTool = (tool: ToolbarToolType) => () => {
    ToolbarStore.selectTool(tool)
  }

  render() {
    // TODO: when splitLink tool works, make isDisabled as:
    // isDisabled = { ToolbarStore.isDisabled(ToolbarToolType.SplitLink) }
    return (
      <>
        <MapControlButton
          onClick={this.selectTool(ToolbarToolType.SplitLink)}
          isActive={ToolbarStore.isSelected(ToolbarToolType.SplitLink)}
          isDisabled={true}
          label="Jaa linkki solmulla"
        >
          <FiScissors />
        </MapControlButton>
      </>
    )
  }
}

export default ToolbarLinkButtons
