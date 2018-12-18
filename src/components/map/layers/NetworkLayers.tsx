import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { toJS } from 'mobx';
import { NetworkStore, NodeSize, MapLayer } from '~/stores/networkStore';
import { RoutePathStore } from '~/stores/routePathStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import TransitTypeHelper from '~/util/transitTypeHelper';
import TransitTypeColorHelper from '~/util/transitTypeColorHelper';
import NodeType from '~/enums/nodeType';
import VectorGridLayer from './VectorGridLayer';

enum GeoserverLayer {
    Node = 'solmu',
    Link = 'linkki',
    Point = 'piste',
}

// TODO: import these from NodeMarker's .scss
enum NodeColors {
    CROSSROAD_COLOR = '#727272',
    CROSSROAD_FILL_COLOR = '#c6c6c6',
    STOP_COLOR = '#3e3c87',
    STOP_FILL_COLOR = '#FFF',
    MUNICIPALITY_BORDER_COLOR = '#c900ff',
}

interface INetworkLayersProps {
    networkStore?: NetworkStore;
    routePathStore?: RoutePathStore;
    toolbarStore?: ToolbarStore;
}

function getGeoServerUrl(layerName: string) {
    const GEOSERVER_URL = process.env.GEOSERVER_URL || 'http://localhost:8080/geoserver';
    // tslint:disable-next-line:max-line-length
    return `${GEOSERVER_URL}/gwc/service/tms/1.0.0/joremapui%3A${layerName}@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf`;
}

@inject('networkStore', 'routePathStore', 'toolbarStore')
@observer
export default class NetworkLayers extends Component<INetworkLayersProps> {
    private getLinkStyle = () => {
        return {
            // Layer name 'linkki' is directly mirrored from Jore through geoserver
            linkki: (properties: any, zoom: number) => {
                const selectedTransitTypes = this.props.networkStore!.selectedTransitTypes;
                const transitType = TransitTypeHelper
                    .convertTransitTypeCodeToTransitType(properties.lnkverkko);
                const color = TransitTypeColorHelper.getColor(transitType);

                if (!selectedTransitTypes.includes(transitType)) {
                    return this.getEmptyStyle();
                }

                return {
                    color,
                    weight: 1,
                    fillOpacity: 1,
                    fill: true,
                };
            },
        };
    }

    private getPointStyle = () => {
        return {
            // Layer name 'piste' is directly mirrored from Jore through geoserver
            piste: (properties: any, zoom: number) => {
                const selectedTransitTypes = this.props.networkStore!.selectedTransitTypes;
                const transitType = TransitTypeHelper
                    .convertTransitTypeCodeToTransitType(properties.lnkverkko);
                const color = TransitTypeColorHelper.getColor(transitType);

                if (!selectedTransitTypes.includes(transitType)) {
                    return this.getEmptyStyle();
                }

                return {
                    color,
                    radius: 1,
                };
            },
        };
    }

    private getNodeStyle = () => {
        return {
            // Layer name 'solmu' is directly mirrored from Jore through geoserver
            solmu: (properties: any, zoom: number) => {
                const { transittypes: transitTypes, soltyyppi: nodeType } = properties;
                const selectedTransitTypes = toJS(this.props.networkStore!.selectedTransitTypes);
                if (transitTypes) {
                    const nodeTransitTypes = TransitTypeHelper
                        .convertTransitTypeCodesToTransitTypes(transitTypes.split(','));
                    if (!selectedTransitTypes.some(type => nodeTransitTypes.includes(type))) {
                        return this.getEmptyStyle();
                    }
                }
                let color;
                let fillColor;
                switch (nodeType) {
                case NodeType.STOP:
                    color = NodeColors.STOP_COLOR;
                    fillColor = NodeColors.STOP_FILL_COLOR;
                    break;
                case NodeType.CROSSROAD:
                    color = NodeColors.CROSSROAD_COLOR;
                    fillColor = NodeColors.CROSSROAD_FILL_COLOR;
                    break;
                case NodeType.MUNICIPALITY_BORDER:
                    color = NodeColors.MUNICIPALITY_BORDER_COLOR;
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

                return {
                    color,
                    radius,
                    fillColor,
                    opacity: 1,
                    fillOpacity: 1,
                    fill: true,
                };
            },
        };
    }

    private getEmptyStyle = () => {
        return {
            fillOpacity: 0,
            stroke: false,
            fill: false,
            opacity: 0,
            weight: 0,
            radius: 0,
        };
    }

    render() {
        const selectedTransitTypes = this.props.networkStore!.selectedTransitTypes;
        const nodeSize = this.props.networkStore!.nodeSize;

        const selectedTool = this.props.toolbarStore!.selectedTool;
        let isNetworkNodesInteractive: boolean;
        let onNetworkNodeClick: Function;
        if (selectedTool) {
            isNetworkNodesInteractive = selectedTool.isNetworkNodesInteractive ?
                selectedTool.isNetworkNodesInteractive() : false;
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
                        vectorTileLayerStyles={this.getLinkStyle()}
                    />
                }
                { this.props.networkStore!.isMapLayerVisible(MapLayer.linkPoint) &&
                    <VectorGridLayer
                        selectedTransitTypes={selectedTransitTypes}
                        key={GeoserverLayer.Point}
                        url={getGeoServerUrl(GeoserverLayer.Point)}
                        vectorTileLayerStyles={this.getPointStyle()}
                    />
                }
                { (this.props.networkStore!.isMapLayerVisible(MapLayer.node)) &&
                    <VectorGridLayer
                        selectedTransitTypes={selectedTransitTypes}
                        nodeSize={nodeSize}
                        onClick={onNetworkNodeClick!}
                        key={GeoserverLayer.Node}
                        url={getGeoServerUrl(GeoserverLayer.Node)}
                        interactive={isNetworkNodesInteractive!}
                        vectorTileLayerStyles={this.getNodeStyle()}
                    />
                }
            </>
        );
    }
}
