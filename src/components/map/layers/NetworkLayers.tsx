
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import VectorgridLayer from './VectorgridLayer';
import { NetworkStore } from '../../../stores/networkStore';
import TransitTypeHelper from '../../../util/transitTypeHelper';
import TransitTypeColorHelper from '../../../util/transitTypeColorHelper';

// tslint:disable-next-line
const linkAddress = 'http://localhost/geoserver/gwc/service/tms/1.0.0/joremapui%3Alinkki@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf';
// tslint:disable-next-line
const pointAddress = 'http://localhost/geoserver/gwc/service/tms/1.0.0/joremapui%3Apiste@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf';

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

    private getNodeStyle = () => {
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
                { this.props.networkStore!.showNodes &&
                    <VectorgridLayer
                        key='points'
                        url={pointAddress}
                        minZoom={15}
                        vectorTileLayerStyles={this.getNodeStyle()}
                    />
                }
            </React.Fragment>

        );
    }
}
