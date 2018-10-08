import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { NetworkStore } from '~/stores/networkStore';
import TransitTypeHelper from '~/util/transitTypeHelper';
import TransitTypeColorHelper from '~/util/transitTypeColorHelper';
import NodeType from '~/enums/nodeType';
import VectorGridLayer from './VectorGridLayer';

const layerNameSeparator = '{LAYER_NAME}';
// TODO: Don't hardcode
// Will be fixed in: https://github.com/HSLdevcom/jore-map-ui/issues/235
// tslint:disable-next-line:max-line-length
const geoserverVectorTileLayerAddress = `http://localhost/geoserver/gwc/service/tms/1.0.0/joremapui%3A${layerNameSeparator}@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf`;

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

@inject('networkStore')
@observer
export default class NetworkLayers extends Component<INetworkLayersProps> {
    private getAddress(layer: GeoserverLayer) {
        return geoserverVectorTileLayerAddress.replace(layerNameSeparator, layer);
    }

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
                        url={this.getAddress(GeoserverLayer.Link)}
                        vectorTileLayerStyles={this.getLinkStyle()}
                    />
                }
                { this.props.networkStore!.isPointsVisible &&
                    <VectorGridLayer
                        key={GeoserverLayer.Point}
                        url={this.getAddress(GeoserverLayer.Point)}
                        vectorTileLayerStyles={this.getPointStyle()}
                    />
                }
                { this.props.networkStore!.isNodesVisible &&
                    <VectorGridLayer
                        key={GeoserverLayer.Node}
                        url={this.getAddress(GeoserverLayer.Node)}
                        vectorTileLayerStyles={this.getNodeStyle()}
                    />
                }
            </>

        );
    }
}
