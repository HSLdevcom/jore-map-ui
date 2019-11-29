import classnames from 'classnames';
import { IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import SidebarHeader from '~/components/sidebar/SidebarHeader';
import NodeForm from '~/components/sidebar/nodeView/NodeForm';
import StopForm from '~/components/sidebar/nodeView/StopForm';
import Constants from '~/constants/constants';
import NodeType from '~/enums/nodeType';
import TransitType from '~/enums/transitType';
import { INode } from '~/models';
import NodeService from '~/services/nodeService';
import { ConfirmStore } from '~/stores/confirmStore';
import { LinkStore } from '~/stores/linkStore';
import { MapStore } from '~/stores/mapStore';
import { MapLayer, NetworkStore, NodeSize } from '~/stores/networkStore';
import { NodeStore } from '~/stores/nodeStore';
import { IPopupProps, PopupStore } from '~/stores/popupStore';
import { isNetworkNodeHidden } from '~/util/NetworkUtils';
import TransitTypeHelper from '~/util/TransitTypeHelper';
import * as s from './NetworkLayers.scss';
import VectorGridLayer from './VectorGridLayer';

enum GeoserverLayer {
    Node = 'solmu',
    Link = 'linkki',
    Point = 'piste'
}

interface INetworkLayersProps {
    mapStore?: MapStore;
    networkStore?: NetworkStore;
    nodeStore?: NodeStore;
    linkStore?: LinkStore;
    popupStore?: PopupStore;
    confirmStore?: ConfirmStore;
}

interface ILinkProperties {
    lnkverkko: TransitType;
    date_ranges?: string;
    lnkalkusolmu: string;
    lnkloppusolmu: string;
}

interface INodeProperties {
    transittypes: string;
    date_ranges?: string;
    soltyyppi: string;
    soltunnus: string;
}

function getGeoServerUrl(layerName: string) {
    const GEOSERVER_URL = Constants.GEOSERVER_URL;
    return `${GEOSERVER_URL}/gwc/service/tms/1.0.0/joremapui%3A${layerName}@jore_EPSG%3A900913@pbf/{z}/{x}/{y}.pbf`;
}

@inject('mapStore', 'networkStore', 'nodeStore', 'linkStore', 'popupStore', 'confirmStore')
@observer
class NetworkLayers extends Component<INetworkLayersProps> {
    private reactionDisposer = {};

    private getLinkStyle = () => {
        return {
            // Layer name 'linkki' is directly mirrored from Jore through geoserver
            linkki: (properties: ILinkProperties) => {
                // if (this.isNetworkElementHidden(properties)) {
                //     return this.getEmptyStyle();
                // }

                return {
                    color: TransitTypeHelper.getColor(properties.lnkverkko),
                    weight: 3,
                    fillOpacity: 1,
                    fill: true
                };
            }
        };
    };

    private getLinkPointStyle = () => {
        return {
            // Layer name 'piste' is directly mirrored from Jore through geoserver
            piste: (properties: ILinkProperties) => {
                // if (this.isNetworkElementHidden(properties)) {
                //     return this.getEmptyStyle();
                // }
                const { lnkverkko: transitTypeCode } = properties;
                return {
                    color: TransitTypeHelper.getColor(transitTypeCode),
                    radius: 1
                };
            }
        };
    };

    // private isNetworkElementHidden = ({
    //     lnkverkko: transitTypeCode,
    //     date_ranges: dateRangesString,
    //     lnkalkusolmu: startNodeId,
    //     lnkloppusolmu: endNodeId
    // }: ILinkProperties) => {
    //     const dateRanges = this.parseDateRangesString(dateRangesString);
    //     const selectedTransitTypes = this.props.networkStore!.selectedTransitTypes;
    //     const selectedDate = this.props.networkStore!.selectedDate;
    //     const link = this.props.linkStore!.link;
    //     const node = this.props.nodeStore!.node;

    //     // the element is related to an opened link
    //     const isLinkOpen =
    //         link &&
    //         link.startNode.id === startNodeId &&
    //         link.endNode.id === endNodeId &&
    //         link.transitType === transitTypeCode;

    //     // the element is related to a link that is related to an opened node
    //     const isLinkRelatedToOpenedNode =
    //         node && (node.id === startNodeId || node.id === endNodeId);

    //     return (
    //         !selectedTransitTypes.includes(transitTypeCode) ||
    //         !this.isDateInRanges(selectedDate, dateRanges) ||
    //         isLinkOpen ||
    //         isLinkRelatedToOpenedNode
    //     );
    // };

    private getNodeStyle = () => {
        return {
            // Layer name 'solmu' is directly mirrored from Jore through geoserver
            solmu: (properties: INodeProperties) => {
                const {
                    transittypes: transitTypeCodes,
                    date_ranges: dateRangesString,
                    soltyyppi: nodeType,
                    soltunnus: nodeId
                } = properties;

                if (isNetworkNodeHidden(nodeId, transitTypeCodes, dateRangesString)) {
                    return this.getEmptyStyle();
                }
                let className;
                switch (nodeType) {
                    case NodeType.STOP:
                        className = s.stop;
                        break;
                    case NodeType.CROSSROAD:
                        className = s.crossroad;
                        break;
                    case NodeType.MUNICIPALITY_BORDER:
                        className = s.border;
                        break;
                }
                let radius: any;
                switch (this.props.networkStore!.nodeSize) {
                    case NodeSize.normal:
                        radius = 5;
                        break;
                    case NodeSize.large:
                        radius = 6;
                        break;
                    default:
                        throw new Error(
                            `nodeSize not supported ${this.props.networkStore!.nodeSize}`
                        );
                }
                if (transitTypeCodes && transitTypeCodes.length === 1) {
                    switch (transitTypeCodes[0]) {
                        case TransitType.BUS:
                            className = classnames(className, s.bus);
                            break;
                        case TransitType.TRAM:
                            className = classnames(className, s.tram);
                            break;
                        case TransitType.SUBWAY:
                            className = classnames(className, s.subway);
                            break;
                        case TransitType.TRAIN:
                            className = classnames(className, s.train);
                            break;
                        case TransitType.FERRY:
                            className = classnames(className, s.ferry);
                            break;
                    }
                }

                return {
                    className,
                    radius
                };
            }
        };
    };

    private getEmptyStyle = () => {
        return { className: s.hidden };
    };

    private onNetworkNodeRightClick = (clickEvent: any) => {
        const nodeId = clickEvent.sourceTarget.properties.soltunnus;
        this.showNodePopup(nodeId);
    };

    private showNodePopup = async (nodeId: string) => {
        const node = await NodeService.fetchNode(nodeId);

        const nodePopup: IPopupProps = {
            content: this.renderNodePopup(node),
            coordinates: node.coordinates,
            isCloseButtonVisible: false
        };
        this.props.popupStore!.showPopup(nodePopup);
    };

    private renderNodePopup = (node: INode) => (popupId: number) => {
        return (
            <div className={s.nodePopup}>
                <div className={s.sidebarHeaderWrapper}>
                    <SidebarHeader
                        isEditButtonVisible={false}
                        hideBackButton={true}
                        onCloseButtonClick={() => this.props.popupStore!.closePopup(popupId)}
                    >
                        Solmu {node.id}
                    </SidebarHeader>
                </div>
                <div className={s.nodeFormWrapper}>
                    <NodeForm
                        node={node}
                        isNewNode={false}
                        isEditingDisabled={true}
                        invalidPropertiesMap={{}}
                    />
                    {node.stop && (
                        <StopForm
                            node={node}
                            isNewStop={false}
                            isEditingDisabled={true}
                            stopAreas={[]}
                            stopSections={[]}
                            stopInvalidPropertiesMap={{}}
                            nodeInvalidPropertiesMap={{}}
                            updateStopProperty={() => () => void 0}
                            isReadOnly={true}
                        />
                    )}
                </div>
            </div>
        );
    };

    /**
     * Sets a reaction object for GeoserverLayer (replaces existing one) so
     * that reaction object's wouldn't multiply each time a VectorGridLayer is re-rendered.
     */
    private setVectorgridLayerReaction = (type: GeoserverLayer) => (
        reaction: IReactionDisposer
    ) => {
        if (this.reactionDisposer[type]) this.reactionDisposer[type]();
        this.reactionDisposer[type] = reaction;
    };

    render() {
        const mapZoomLevel = this.props.mapStore!.zoom;
        if (mapZoomLevel <= Constants.MAP_LAYERS_MIN_ZOOM_LEVEL) {
            return null;
        }
        const isMapLoading = Boolean(
            this.props.mapStore!.isMapCenteringPrevented || !this.props.mapStore!.coordinates
        );
        if (isMapLoading) return null;

        const selectedTransitTypes = this.props.networkStore!.selectedTransitTypes;
        const selectedDate = this.props.networkStore!.selectedDate;
        const nodeSize = this.props.networkStore!.nodeSize;
        return (
            <>
                {this.props.networkStore!.isMapLayerVisible(MapLayer.link) && (
                    <VectorGridLayer
                        selectedTransitTypes={selectedTransitTypes}
                        selectedDate={selectedDate}
                        key={GeoserverLayer.Link}
                        setVectorgridLayerReaction={this.setVectorgridLayerReaction(
                            GeoserverLayer.Link
                        )}
                        url={getGeoServerUrl(GeoserverLayer.Link)}
                        interactive={false}
                        vectorTileLayerStyles={this.getLinkStyle()}
                    />
                )}
                {this.props.networkStore!.isMapLayerVisible(MapLayer.linkPoint) && (
                    <VectorGridLayer
                        selectedTransitTypes={selectedTransitTypes}
                        selectedDate={selectedDate}
                        key={GeoserverLayer.Point}
                        setVectorgridLayerReaction={this.setVectorgridLayerReaction(
                            GeoserverLayer.Point
                        )}
                        url={getGeoServerUrl(GeoserverLayer.Point)}
                        interactive={false}
                        vectorTileLayerStyles={this.getLinkPointStyle()}
                    />
                )}
                {(this.props.networkStore!.isMapLayerVisible(MapLayer.node) ||
                    this.props.networkStore!.isMapLayerVisible(MapLayer.nodeWithoutLink)) && (
                    <VectorGridLayer
                        selectedTransitTypes={selectedTransitTypes}
                        selectedDate={selectedDate}
                        nodeSize={nodeSize}
                        onContextMenu={this.onNetworkNodeRightClick}
                        key={GeoserverLayer.Node}
                        setVectorgridLayerReaction={this.setVectorgridLayerReaction(
                            GeoserverLayer.Node
                        )}
                        url={getGeoServerUrl(GeoserverLayer.Node)}
                        interactive={true}
                        vectorTileLayerStyles={this.getNodeStyle()}
                    />
                )}
            </>
        );
    }
}

export default NetworkLayers;
