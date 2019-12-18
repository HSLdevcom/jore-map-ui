import classnames from 'classnames';
import { IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import Constants from '~/constants/constants';
import NodeType from '~/enums/nodeType';
import TransitType from '~/enums/transitType';
import NodeService from '~/services/nodeService';
import { ConfirmStore } from '~/stores/confirmStore';
import { LinkStore } from '~/stores/linkStore';
import { MapStore } from '~/stores/mapStore';
import { MapLayer, NetworkStore, NodeSize } from '~/stores/networkStore';
import { NodeStore } from '~/stores/nodeStore';
import { IPopupProps, PopupStore } from '~/stores/popupStore';
import EventManager, {
    INetworkLinkClickParams,
    INetworkNodeClickParams
} from '~/util/EventManager';
import TransitTypeHelper from '~/util/TransitTypeHelper';
import { isNetworkElementHidden, isNetworkNodeHidden } from '~/util/networkUtils';
import * as s from './NetworkLayers.scss';
import VectorGridLayer from './VectorGridLayer';
import { INodePopupData } from './popups/NodePopup';

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
                const {
                    lnkalkusolmu: startNodeId,
                    lnkloppusolmu: endNodeId,
                    lnkverkko: transitType,
                    date_ranges: dateRangesString
                } = properties;

                if (
                    isNetworkElementHidden({
                        transitType,
                        startNodeId,
                        endNodeId,
                        type: MapLayer.link,
                        dateRangesString: dateRangesString!
                    })
                ) {
                    return this.getEmptyStyle();
                }

                return {
                    color: TransitTypeHelper.getColor(transitType),
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
                const {
                    lnkalkusolmu: startNodeId,
                    lnkloppusolmu: endNodeId,
                    lnkverkko: transitType,
                    date_ranges: dateRangesString
                } = properties;

                if (
                    isNetworkElementHidden({
                        transitType,
                        startNodeId,
                        endNodeId,
                        type: MapLayer.linkPoint,
                        dateRangesString: dateRangesString!
                    })
                ) {
                    return this.getEmptyStyle();
                }
                return {
                    color: TransitTypeHelper.getColor(transitType),
                    radius: 1
                };
            }
        };
    };

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

                if (isNetworkNodeHidden({ nodeId, transitTypeCodes, dateRangesString })) {
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
        const popupData: INodePopupData = {
            node
        };
        const nodePopup: IPopupProps = {
            type: 'nodePopup',
            data: popupData,
            coordinates: node.coordinates,
            isCloseButtonVisible: false
        };

        this.props.popupStore!.showPopup(nodePopup);
    };

    private onNetworkNodeClick = (clickEvent: any) => {
        const properties = clickEvent.sourceTarget.properties;
        const clickParams: INetworkNodeClickParams = {
            nodeId: properties.soltunnus,
            nodeType: properties.soltyyppi
        };
        EventManager.trigger('networkNodeClick', clickParams);
    };

    private onNetworkLinkClick = (clickEvent: any) => {
        const properties = clickEvent.sourceTarget.properties;
        const clickParams: INetworkLinkClickParams = {
            startNodeId: properties.lnkalkusolmu,
            endNodeId: properties.lnkloppusolmu,
            transitType: properties.lnkverkko
        };
        EventManager.trigger('networkLinkClick', clickParams);
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
        if (!this.props.mapStore!.coordinates) return null;

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
                        onClick={this.onNetworkLinkClick}
                        setVectorgridLayerReaction={this.setVectorgridLayerReaction(
                            GeoserverLayer.Link
                        )}
                        url={getGeoServerUrl(GeoserverLayer.Link)}
                        interactive={true}
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
                        onClick={this.onNetworkNodeClick}
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
