import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { NetworkStore } from '~/stores/networkStore';
import TransitTypeHelper from '~/util/transitTypeHelper';
import TransitTypeColorHelper from '~/util/transitTypeColorHelper';
import NodeType from '~/enums/nodeType';
import VectorGridLayer from './VectorGridLayer';

enum GeoserverLayer {
    Node = 'solmu',
    Link = 'linkki',
    Point = 'piste',
}

enum NodeColors {
    CROSSROAD_COLOR = '#727272',
    STOP_COLOR = '#ff7070',
}

interface INetworkLayersProps {
    networkStore?: NetworkStore;
}

function getGeoServerUrl(layerName: string) {
    const GEOSERVER_URL = process.env.GEOSERVER_URL || 'http://localhost:8080/geoserver';
    // tslint:disable-next-line:max-line-length
    return `${GEOSERVER_URL}/gwc/service/tms/1.0.0/joremapui%3A${layerName}@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf`;
}

@inject('networkStore')
@observer
export default class NetworkLayers extends Component<INetworkLayersProps> {
    private getLinkStyle = () => {
        return {
            // Layer name 'linkki' is directly mirrored from Jore through geoserver
            linkki: (properties: any, zoom: any) => {
                const type = TransitTypeHelper
                    .convertTransitTypeCodeToTransitType(properties.lnkverkko);

                const color = TransitTypeColorHelper.getColor(type);

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
            piste: (properties: any, zoom: any) => {
                const type = TransitTypeHelper
                    .convertTransitTypeCodeToTransitType(properties.lnkverkko);

                const color = TransitTypeColorHelper.getColor(type);

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
            solmu: (properties: any, zoom: any) => {
                let color;
                switch (properties.soltyyppi) {
                case NodeType.STOP:
                    color = NodeColors.STOP_COLOR;
                    break;
                case NodeType.CROSSROAD:
                    color = NodeColors.CROSSROAD_COLOR;
                    break;
                }

                return {
                    color,
                    radius: 2,
                };
            },
        };
    }

    render() {
        return (
            <>
                { this.props.networkStore!.isLinksVisible &&
                    <VectorGridLayer
                        key={GeoserverLayer.Link}
                        url={getGeoServerUrl(GeoserverLayer.Link)}
                        vectorTileLayerStyles={this.getLinkStyle()}
                    />
                }
                { this.props.networkStore!.isPointsVisible &&
                    <VectorGridLayer
                        key={GeoserverLayer.Point}
                        url={getGeoServerUrl(GeoserverLayer.Point)}
                        vectorTileLayerStyles={this.getPointStyle()}
                    />
                }
                { this.props.networkStore!.isNodesVisible &&
                    <VectorGridLayer
                        key={GeoserverLayer.Node}
                        url={getGeoServerUrl(GeoserverLayer.Node)}
                        vectorTileLayerStyles={this.getNodeStyle()}
                    />
                }
            </>

        );
    }
}
