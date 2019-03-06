
import BaseTool from './BaseTool';

export default interface MapTool extends BaseTool {
    onNetworkNodeClick?: Function;
    onRoutePathLinkClick?: Function;
    onNodeClick?: Function;
    isNodeHighlighted?: Function;
    /** TODO:
     * isNetworkLinksInteractive?: Function
     * onNetworkLinkClick?: Function
     * isNetworkLinkPointsInteractive?: Function
     * onNetworkLinkPointClick?: Function
    * **/
}
