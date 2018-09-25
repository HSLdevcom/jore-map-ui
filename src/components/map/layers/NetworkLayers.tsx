
import React, { Component } from 'react';
import VectorgridLayer from './VectorgridLayer';

// tslint:disable-next-line
const linkAddress = 'http://localhost/geoserver/gwc/service/tms/1.0.0/joremapui%3Alinkki@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf';
// tslint:disable-next-line
const pointAddress = 'http://localhost/geoserver/gwc/service/tms/1.0.0/joremapui%3Apiste@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf';

export default class NetworkLayers extends Component {
    render() {
        return (
            <React.Fragment>
                <VectorgridLayer
                    key='links'
                    url={linkAddress}
                />
                <VectorgridLayer
                    key='points'
                    url={pointAddress}
                />
            </React.Fragment>

        );
    }
}
