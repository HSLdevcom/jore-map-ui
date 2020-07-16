import { IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import constants from '~/constants/constants';
import TransitType from '~/enums/transitType';
import EventHelper, { ILinkClickParams, INodeClickParams } from '~/helpers/EventHelper';
import NodeService from '~/services/nodeService';
import { LinkStore } from '~/stores/linkStore';
import { MapStore } from '~/stores/mapStore';
import { MapLayer, NetworkStore } from '~/stores/networkStore';
import { NodeStore } from '~/stores/nodeStore';
import { IPopupProps, PopupStore } from '~/stores/popupStore';
import TransitTypeUtils from '~/utils/TransitTypeUtils';
import { isNetworkLinkHidden, isNetworkLinkPointHidden } from '~/utils/networkUtils';
import * as s from './NetworkLayers.scss';
import NodeLayer from './NodeLayer';
import VectorGridLayer from './VectorGridLayer';
import { INodePopupData } from './popups/NodePopup';

enum GeoserverLayer {
    Node = 'solmu',
    Link = 'linkki',
    Point = 'piste',
}

interface INetworkLayersProps {
    map: any;
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
                    date_ranges: dateRangesString,
                } = properties;

                if (
                    isNetworkLinkHidden({
                        transitType,
                        startNodeId,
                        endNodeId,
                        dateRangesString: dateRangesString!,
                    })
                ) {
                    return this.getEmptyStyle();
                }

                return {
                    color: TransitTypeUtils.getColor(transitType),
                    weight: 3,
                    fillOpacity: 1,
                    fill: true,
                };
            },
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
                    date_ranges: dateRangesString,
                } = properties;

                if (
                    isNetworkLinkPointHidden({
                        transitType,
                        startNodeId,
                        endNodeId,
                        dateRangesString: dateRangesString!,
                    })
                ) {
                    return this.getEmptyStyle();
                }
                return {
                    color: TransitTypeUtils.getColor(transitType),
                    radius: 1,
                };
            },
        };
    };

    private getEmptyStyle = () => {
        return { className: s.hidden };
    };

    private onNetworkNodeRightClick = (nodeId: string) => {
        this.showNodePopup(nodeId);
    };

    private showNodePopup = async (nodeId: string) => {
        const node = await NodeService.fetchNode(nodeId);
        const popupData: INodePopupData = {
            node: node!,
        };
        const nodePopup: IPopupProps = {
            type: 'nodePopup',
            data: popupData,
            coordinates: node!.coordinates,
            isCloseButtonVisible: false,
        };

        this.props.popupStore!.showPopup(nodePopup);
    };

    private onNetworkNodeClick = (nodeId: string) => {
        const clickParams: INodeClickParams = {
            nodeId,
        };
        EventHelper.trigger('networkNodeClick', clickParams);
    };

    private onNetworkLinkClick = (clickEvent: any) => {
        const properties = clickEvent.sourceTarget.properties;
        const clickParams: ILinkClickParams = {
            startNodeId: properties.lnkalkusolmu,
            endNodeId: properties.lnkloppusolmu,
            transitType: properties.lnkverkko,
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
        return (
            <>
                {(this.props.networkStore!.isMapLayerVisible(MapLayer.link) ||
                    this.props.networkStore!.isMapLayerVisible(MapLayer.unusedLink)) && (
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
                    <NodeLayer
                        map={this.props.map}
                        onClick={this.onNetworkNodeClick}
                        onContextMenu={this.onNetworkNodeRightClick}
                    />
                )}
            </>
        );
    }
}

export default NetworkLayers;
