import classnames from 'classnames';
import { IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import constants from '~/constants/constants';
import NodeType from '~/enums/nodeType';
import TransitType from '~/enums/transitType';
import EventHelper, {
    INetworkLinkClickParams,
    INetworkNodeClickParams
} from '~/helpers/EventHelper';
import NodeService from '~/services/nodeService';
import { LinkStore } from '~/stores/linkStore';
import { MapStore } from '~/stores/mapStore';
import { MapLayer, NetworkStore, NodeSize } from '~/stores/networkStore';
import { NodeStore } from '~/stores/nodeStore';
import { IPopupProps, PopupStore } from '~/stores/popupStore';
import TransitTypeUtils from '~/utils/TransitTypeUtils';
import { isNetworkElementHidden, isNetworkNodeHidden } from '~/utils/networkUtils';
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
}

interface ILinkProperties {
    lnkverkko: TransitType;
    date_ranges?: string;
    lnkalkusolmu: string;
    lnkloppusolmu: string;
}

interface INodeProperties {
    transit_types: string;
    date_ranges?: string;
    soltyyppi: string;
    soltunnus: string;
}

function getGeoServerUrl(layerName: string) {
    const GEOSERVER_URL = constants.GEOSERVER_URL;
    return `${GEOSERVER_URL}/gwc/service/tms/1.0.0/joremapui%3A${layerName}@jore_EPSG%3A900913@pbf/{z}/{x}/{y}.pbf`;
}

@inject('mapStore', 'networkStore', 'nodeStore', 'linkStore', 'popupStore')
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
                    color: TransitTypeUtils.getColor(transitType),
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
                    color: TransitTypeUtils.getColor(transitType),
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
                    transit_types: transitTypeCodes,
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
                        radius = 6;
                        break;
                    case NodeSize.large:
                        radius = 7;
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
            node: node!
        };
        const nodePopup: IPopupProps = {
            type: 'nodePopup',
            data: popupData,
            coordinates: node!.coordinates,
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
        EventHelper.trigger('networkNodeClick', clickParams);
    };

    private onNetworkLinkClick = (clickEvent: any) => {
        const properties = clickEvent.sourceTarget.properties;
        const clickParams: INetworkLinkClickParams = {
            startNodeId: properties.lnkalkusolmu,
            endNodeId: properties.lnkloppusolmu,
            transitType: properties.lnkverkko
        };
        EventHelper.trigger('networkLinkClick', clickParams);
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
        if (this.props.mapStore!.areNetworkLayersHidden) return null;
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
                    this.props.networkStore!.isMapLayerVisible(MapLayer.unusedNode)) && (
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
