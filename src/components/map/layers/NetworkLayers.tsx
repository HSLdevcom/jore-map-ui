
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import VectorGridLayer from './VectorGridLayer';
import { NetworkStore } from '../../../stores/networkStore';
import TransitTypeHelper from '../../../util/transitTypeHelper';
import TransitTypeColorHelper from '../../../util/transitTypeColorHelper';
import NodeType from '../../../enums/nodeType';

const layerNameSeparator = '{LAYER_NAME}';
// tslint:disable-next-line:max-line-length
const geoserverVectorTileLayerAddress = `http://localhost/geoserver/gwc/service/tms/1.0.0/joremapui%3A${layerNameSeparator}@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf`;

enum geoserverLayer {
    Node = 'solmu',
    Link = 'linkki',
    Point = 'piste',
}

enum nodeColors {
    CROSSROAD_COLOR = '#727272',
    STOP_COLOR = '#ff7070',
}

interface INetworkLayersProps {
    networkStore?: NetworkStore;
}

@inject('networkStore')
@observer
export default class NetworkLayers extends Component<INetworkLayersProps> {
    private getAddress(layer: geoserverLayer) {
        return geoserverVectorTileLayerAddress.replace(layerNameSeparator, layer);
    }

    private getLinkStyle = () => {
        return {
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
            solmu: (properties: any, zoom: any) => {
                let color;
                switch (properties.soltyyppi) {
                case NodeType.STOP:
                    color = nodeColors.STOP_COLOR;
                    break;
                case NodeType.CROSSROAD:
                    color = nodeColors.CROSSROAD_COLOR;
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
            <React.Fragment>
                { this.props.networkStore!.showLinks &&
                    <VectorgridLayer
                        key={geoserverLayer.Link}
                        url={this.getAddress(geoserverLayer.Link)}
                        vectorTileLayerStyles={this.getLinkStyle()}
                    />
                }
                { this.props.networkStore!.showPoints &&
                    <VectorgridLayer
                        key={geoserverLayer.Point}
                        url={this.getAddress(geoserverLayer.Point)}
                        vectorTileLayerStyles={this.getPointStyle()}
                    />
                }
                { this.props.networkStore!.showNodes &&
                    <VectorgridLayer
                        key={geoserverLayer.Node}
                        url={this.getAddress(geoserverLayer.Node)}
                        vectorTileLayerStyles={this.getNodeStyle()}
                    />
                }
            </React.Fragment>

        );
    }
}
