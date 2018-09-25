
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import VectorgridLayer from './VectorgridLayer';
import { NetworkStore } from '../../../stores/networkStore';
import TransitTypeHelper from '../../../util/transitTypeHelper';
import TransitTypeColorHelper from '../../../util/transitTypeColorHelper';
import * as NodeLayer from './NodeLayer';
import NodeType from '../../../enums/nodeType';

// tslint:disable-next-line
const linkAddress = 'http://localhost/geoserver/gwc/service/tms/1.0.0/joremapui%3Alinkki@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf';
// tslint:disable-next-line
const pointAddress = 'http://localhost/geoserver/gwc/service/tms/1.0.0/joremapui%3Apiste@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf';
// tslint:disable-next-line
const nodeAddress = 'http://localhost/geoserver/gwc/service/tms/1.0.0/joremapui%3Asolmu@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf';

interface INetworkLayersProps {
    networkStore?: NetworkStore;
}

@inject('networkStore')
@observer
export default class NetworkLayers extends Component<INetworkLayersProps> {
    private getLinkStyle = () => {
        return {
            linkki: (properties: any, zoom: any) => {
                return {
                    weight: 1,
                    color: '#549ae6',
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
                    color = NodeLayer.color.STOP_BORDER_COLOR;
                    break;
                case NodeType.CROSSROAD:
                    color = NodeLayer.color.CROSSROAD_BORDER_COLOR;
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
                        key='links'
                        url={linkAddress}
                        minZoom={12}
                        vectorTileLayerStyles={this.getLinkStyle()}
                    />
                }
                { this.props.networkStore!.showPoints &&
                    <VectorgridLayer
                        key='points'
                        url={pointAddress}
                        minZoom={15}
                        vectorTileLayerStyles={this.getPointStyle()}
                    />
                }
                { this.props.networkStore!.showNodes &&
                    <VectorgridLayer
                        key='nodes'
                        url={nodeAddress}
                        vectorTileLayerStyles={this.getNodeStyle()}
                    />
                }
            </React.Fragment>

        );
    }
}
