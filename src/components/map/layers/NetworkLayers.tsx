import L from 'leaflet';
import { IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import constants from '~/constants/constants';
import TransitType from '~/enums/transitType';
import EventListener, { INodeClickParams } from '~/helpers/EventListener';
import NodeService from '~/services/nodeService';
import { LinkStore } from '~/stores/linkStore';
import { MapStore } from '~/stores/mapStore';
import { MapLayer, NetworkStore } from '~/stores/networkStore';
import { NodeStore } from '~/stores/nodeStore';
import { IPopupProps, PopupStore } from '~/stores/popupStore';
import TransitTypeUtils from '~/utils/TransitTypeUtils';
import { isNetworkLinkHidden, isNetworkLinkPointHidden } from '~/utils/networkUtils';
import NodeLayer from './NodeLayer';
import VectorGridLayer from './VectorGridLayer';
import * as s from './networkLayers.scss';
import { INodePopupData } from './popups/NodePopup';

enum TileserverLayer {
    Link = 'linkki_view',
    Point = 'piste_view',
}

const SCHEMA = 'jore';

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

function getTileserverUrl(layerName: string) {
    const TILESERVER_URL = constants.TILESERVER_URL;
    return `${TILESERVER_URL}/${SCHEMA}.${layerName}/{z}/{x}/{y}.pbf`;
}

@inject('mapStore', 'networkStore', 'nodeStore', 'linkStore', 'popupStore')
@observer
class NetworkLayers extends Component<INetworkLayersProps> {
    private reactionDisposer = {};

    private getLinkStyle = () => {
        return {
            // Layer name 'linkki' is directly mirrored from Jore through tileserver
            [`${SCHEMA}.${TileserverLayer.Link}`]: (properties: ILinkProperties) => {
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
            // Layer name 'piste' is directly mirrored from Jore through tileserver
            [`${SCHEMA}.${TileserverLayer.Point}`]: (properties: ILinkProperties) => {
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

    private onNetworkNodeClick = (nodeId: string, e: L.LeafletEvent) => {
        EventListener.trigger('mapClick', e);

        const clickParams: INodeClickParams = {
            nodeId,
        };
        EventListener.trigger('networkNodeClick', clickParams);
    };

    /**
     * Sets a reaction object for TileserverLayer (replaces existing one) so
     * that reaction object's wouldn't multiply each time a VectorGridLayer is re-rendered.
     */
    private setVectorgridLayerReaction = (type: TileserverLayer) => (
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
                        key={TileserverLayer.Link}
                        setVectorgridLayerReaction={this.setVectorgridLayerReaction(
                            TileserverLayer.Link
                        )}
                        url={getTileserverUrl(TileserverLayer.Link)}
                        interactive={true}
                        vectorTileLayerStyles={this.getLinkStyle()}
                    />
                )}
                {this.props.networkStore!.isMapLayerVisible(MapLayer.linkPoint) && (
                    <VectorGridLayer
                        selectedTransitTypes={selectedTransitTypes}
                        selectedDate={selectedDate}
                        key={TileserverLayer.Point}
                        setVectorgridLayerReaction={this.setVectorgridLayerReaction(
                            TileserverLayer.Point
                        )}
                        url={getTileserverUrl(TileserverLayer.Point)}
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
