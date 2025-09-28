import ToolbarToolType from '~/enums/toolbarToolType'
import BaseTool from './BaseTool'

// TODO: implement this tool
class PrintTool implements BaseTool {
  public toolType = ToolbarToolType.Print
  public activate = () => {}
  public deactivate = () => {}
  public getToolPhase = () => {}
  public setToolPhase = () => {}
}

export default PrintTool
