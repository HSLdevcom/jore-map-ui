import ToolbarTool from '~/enums/toolbarTool';

export default interface BaseTool {
    toolType: ToolbarTool;
    activate: Function;
    deactivate: Function;
    toolHelpHeader?: string;
    toolHelpText?: string;
    onNetworkNodeClick?: Function;
    onRoutePathLinkClick?: Function;
    onNodeClick?: Function;
    /** TODO:
     * isNetworkLinksInteractive?: Function
     * onNetworkLinkClick?: Function
     * isNetworkLinkPointsInteractive?: Function
     * onNetworkLinkPointClick?: Function
    * **/
}
