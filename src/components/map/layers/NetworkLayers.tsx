import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import MapStore, { NodeSize } from '~/stores/mapStore';
import NodeService from '~/services/nodeService';
import { NetworkStore } from '~/stores/networkStore';
import TransitTypeHelper from '~/util/transitTypeHelper';
import TransitTypeColorHelper from '~/util/transitTypeColorHelper';
import { NewRoutePathStore } from '~/stores/new/newRoutePathStore';
import NodeType from '~/enums/nodeType';
import VectorGridLayer from './VectorGridLayer';

enum GeoserverLayer {
    Node = 'solmu',
    Link = 'linkki',
    Point = 'piste',
}

// TODO: use .scss for these?
enum NodeColors {
    CROSSROAD_COLOR = '#727272',
    CROSSROAD_FILL_COLOR = '#c6c6c6',
    STOP_COLOR = '#3e3c87',
    STOP_FILL_COLOR = '#FFF',
    IS_EDITING_STOP_COLOR = '#3e3c87',
    IS_EDITING_STOP_FILL_COLOR = '#FFF',
}

interface INetworkLayersProps {
    networkStore?: NetworkStore;
    newRoutePathStore?: NewRoutePathStore;
}

function getGeoServerUrl(layerName: string) {
    const GEOSERVER_URL = process.env.GEOSERVER_URL || 'http://localhost:8080/geoserver';
    // tslint:disable-next-line:max-line-length
    return `${GEOSERVER_URL}/gwc/service/tms/1.0.0/joremapui%3A${layerName}@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf`;
}

@inject('networkStore', 'newRoutePathStore')
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
        const isCreatingNewRoutePath = MapStore.isCreatingNewRoutePath;

        let radius: any;
        switch (MapStore.nodeSize) {
        case NodeSize.normal:
            radius = 4;
            break;
        case NodeSize.large:
            radius = 6;
            break;
        default:
            throw new Error(`nodeSize not supported ${MapStore.nodeSize}`);
        }

        return {
            // Layer name 'solmu' is directly mirrored from Jore through geoserver
            solmu: (properties: any, zoom: any) => {
                let color;
                let fillColor;

                switch (properties.soltyyppi) {
                case NodeType.STOP:
                    color = isCreatingNewRoutePath ?
                        NodeColors.IS_EDITING_STOP_COLOR : NodeColors.STOP_COLOR;
                    fillColor = isCreatingNewRoutePath ?
                        NodeColors.IS_EDITING_STOP_FILL_COLOR : NodeColors.STOP_FILL_COLOR;
                    break;
                case NodeType.CROSSROAD:
                    color = NodeColors.CROSSROAD_COLOR;
                    fillColor = NodeColors.CROSSROAD_FILL_COLOR;
                    break;
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

    private addNodeFromClickEvent = (clickEvent: any) => {
        const properties =  clickEvent.sourceTarget.properties;
        // TODO: Use factory call instead of service call because
        // geojson / geojsonManual are not found from properties
        NodeService.fetchNode(properties.soltunnus).then((node) => {
            if (node) {
                this.props.newRoutePathStore!.addNode({
                    id: node.id,
                    coordinates: node.coordinates,
                });
            }
        });
    }

    render() {
        const isCreatingNewRoutePath = MapStore.isCreatingNewRoutePath;

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
                { (this.props.networkStore!.isNodesVisible) &&
                    <VectorGridLayer
                        onClick={isCreatingNewRoutePath ? this.addNodeFromClickEvent : null}
                        key={GeoserverLayer.Node}
                        url={getGeoServerUrl(GeoserverLayer.Node)}
                        interactive={isCreatingNewRoutePath}
                        vectorTileLayerStyles={this.getNodeStyle()}
                    />
                }
            </>
        );
    }
}
