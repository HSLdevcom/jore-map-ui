import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import classNames from 'classnames';
import { EditNetworkStore } from '~/stores/editNetworkStore';
import { MapLayer, NetworkStore, NodeSize } from '~/stores/networkStore';
import { RoutePathStore } from '~/stores/routePathStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import TransitTypeHelper from '~/util/transitTypeHelper';
import TransitTypeColorHelper from '~/util/transitTypeColorHelper';
import NodeType from '~/enums/nodeType';
import TransitType from '~/enums/transitType';
import VectorGridLayer from './VectorGridLayer';
import * as s from './NetworkLayers.scss';

enum GeoserverLayer {
    Node = 'solmu',
    Link = 'linkki',
    Point = 'piste',
}

interface INetworkLayersProps {
    networkStore?: NetworkStore;
    editNetworkStore?: EditNetworkStore;
    routePathStore?: RoutePathStore;
    toolbarStore?: ToolbarStore;
}

function getGeoServerUrl(layerName: string) {
    const GEOSERVER_URL = process.env.GEOSERVER_URL || 'http://localhost:8080/geoserver';
    // tslint:disable-next-line:max-line-length
    return `${GEOSERVER_URL}/gwc/service/tms/1.0.0/joremapui%3A${layerName}@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf`;
}

@inject('networkStore', 'editNetworkStore', 'routePathStore', 'toolbarStore')
@observer
class NetworkLayers extends Component<INetworkLayersProps> {
    private getLinkStyle = () => {
        return {
            // Layer name 'linkki' is directly mirrored from Jore through geoserver
            linkki: (properties: any, zoom: number) => {
                const {
                    lnkverkko: transitTypeCode,
                    lnkalkusolmu: startNodeId,
                    lnkloppusolmu: endNodeId,
                } = properties;
                const transitType = TransitTypeHelper
                    .convertTransitTypeCodeToTransitType(transitTypeCode);

                if (this.isLinkHidden(transitType, startNodeId, endNodeId)) {
                    return this.getEmptyStyle();
                }

                return {
                    color: TransitTypeColorHelper.getColor(transitType),
                    weight: 1,
                    fillOpacity: 1,
                    fill: true,
                };
            },
        };
    }

    private isLinkHidden = (transitType: TransitType, startNodeId: string, endNodeId: string) => {
        return this.isNetworkElementHidden(transitType, startNodeId, endNodeId);
    }

    private getLinkPointStyle = () => {
        return {
            // Layer name 'piste' is directly mirrored from Jore through geoserver
            piste: (properties: any, zoom: number) => {
                const {
                    lnkverkko: transitTypeCode,
                    lnkalkusolmu: startNodeId,
                    lnkloppusolmu: endNodeId,
                } = properties;
                const transitType = TransitTypeHelper
                    .convertTransitTypeCodeToTransitType(transitTypeCode);

                if (this.isLinkPointHidden(transitType, startNodeId, endNodeId)) {
                    return this.getEmptyStyle();
                }

                return {
                    color: TransitTypeColorHelper.getColor(transitType),
                    radius: 1,
                };
            },
        };
    }

    private isLinkPointHidden =
    (transitType: TransitType, startNodeId: string, endNodeId: string) => {
        return this.isNetworkElementHidden(transitType, startNodeId, endNodeId);
    }

    private isNetworkElementHidden =
    (transitType: TransitType, startNodeId: string, endNodeId: string) => {
        const selectedTransitTypes = this.props.networkStore!.selectedTransitTypes;
        if (!selectedTransitTypes.includes(transitType)) {
            return true;
        }
        const node = this.props.editNetworkStore!.node;
        return Boolean(node && (node.id === startNodeId || node.id === endNodeId));
    }

    private getNodeStyle = () => {
        return {
            // Layer name 'solmu' is directly mirrored from Jore through geoserver
            solmu: (properties: any, zoom: number) => {
                const {
                    transittypes: transitTypeCodes,
                    soltyyppi: nodeType,
                    soltunnus: nodeId,
                } = properties;

                if (this.isNodeHidden(nodeId, transitTypeCodes)) {
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
                    radius = 4;
                    break;
                case NodeSize.large:
                    radius = 6;
                    break;
                default:
                    throw new Error(`nodeSize not supported ${this.props.networkStore!.nodeSize}`);
                }
                if (transitTypeCodes && transitTypeCodes.length === 1) {
                    switch (TransitTypeHelper
                        .convertTransitTypeCodeToTransitType(transitTypeCodes[0])) {
                    case TransitType.BUS:
                            className = classNames(className, s.bus);
                            break;
                    case TransitType.TRAM:
                            className = classNames(className, s.tram);
                            break;
                    case TransitType.SUBWAY:
                            className = classNames(className, s.subway);
                            break;
                    case TransitType.TRAIN:
                            className = classNames(className, s.train);
                            break;
                    case TransitType.FERRY:
                            className = classNames(className, s.ferry);
                            break;
                    }
                }

                return {
                    className,
                    radius,
                };
            },
        };
    }

    private isNodeHidden = (nodeId: string, transitTypeCodes: string) => {
        const node = this.props.editNetworkStore!.node;
        if (node && node.id === nodeId) {
            return true;
        }

        const selectedTransitTypes = toJS(this.props.networkStore!.selectedTransitTypes);
        if (this.hasNodeLinks(transitTypeCodes)) {
            if (!this.props.networkStore!.isMapLayerVisible(MapLayer.node)) {
                return true;
            }
            const nodeTransitTypes = TransitTypeHelper
                .convertTransitTypeCodesToTransitTypes(transitTypeCodes.split(','));
            if (!selectedTransitTypes.some(type => nodeTransitTypes.includes(type))) {
                return true;
            }
        } else {
            if (!this.props.networkStore!.isMapLayerVisible(MapLayer.nodeWithoutLink)) {
                return true;
            }
        }
        return false;
    }

    private hasNodeLinks(transitTypeCodes: string) {
        return Boolean(transitTypeCodes);
    }

    private getEmptyStyle = () => {
        return { className: s.hidden };
    }

    render() {
        const selectedTransitTypes = this.props.networkStore!.selectedTransitTypes;
        const nodeSize = this.props.networkStore!.nodeSize;

        const selectedTool = this.props.toolbarStore!.selectedTool;
        let onNetworkNodeClick: Function;
        if (selectedTool) {
            onNetworkNodeClick = selectedTool.onNetworkNodeClick ?
            selectedTool.onNetworkNodeClick : () => {};
        }

        return (
            <>
                { this.props.networkStore!.isMapLayerVisible(MapLayer.link) &&
                    <VectorGridLayer
                        selectedTransitTypes={selectedTransitTypes}
                        key={GeoserverLayer.Link}
                        url={getGeoServerUrl(GeoserverLayer.Link)}
                        interactive={true}
                        vectorTileLayerStyles={this.getLinkStyle()}
                    />
                }
                { this.props.networkStore!.isMapLayerVisible(MapLayer.linkPoint) &&
                    <VectorGridLayer
                        selectedTransitTypes={selectedTransitTypes}
                        key={GeoserverLayer.Point}
                        url={getGeoServerUrl(GeoserverLayer.Point)}
                        interactive={true}
                        vectorTileLayerStyles={this.getLinkPointStyle()}
                    />
                }
                { (this.props.networkStore!.isMapLayerVisible(MapLayer.node)
                || this.props.networkStore!.isMapLayerVisible(MapLayer.nodeWithoutLink)) &&
                    <VectorGridLayer
                        selectedTransitTypes={selectedTransitTypes}
                        nodeSize={nodeSize}
                        onClick={onNetworkNodeClick!}
                        key={GeoserverLayer.Node}
                        url={getGeoServerUrl(GeoserverLayer.Node)}
                        interactive={true}
                        vectorTileLayerStyles={this.getNodeStyle()}
                    />
                }
            </>
        );
    }
}

export default NetworkLayers;
