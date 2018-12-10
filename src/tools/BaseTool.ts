import ToolbarTool from '~/enums/toolbarTool';

export default interface BaseMapTool {
    toolType: ToolbarTool;
    activate: Function;
    deactivate: Function;
    isNetworkNodesInteractive?: Function;
    onNetworkNodeClick?: Function;
    /** TODO:
     * isNetworkLinksInteractive?: Function
     * onNetworkLinkClick?: Function
     * isNetworkLinkPointsInteractive?: Function
     * onNetworkLinkPointClick?: Function
    * **/
}
