import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import classNames from 'classnames';
import Moment from 'moment';
import Constants from '~/constants/constants';
import { NodeStore } from '~/stores/nodeStore';
import { LinkStore } from '~/stores/linkStore';
import { MapStore } from '~/stores/mapStore';
import { MapLayer, NetworkStore, NodeSize } from '~/stores/networkStore';
import { RoutePathStore } from '~/stores/routePathStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import TransitTypeHelper from '~/util/transitTypeHelper';
import TransitTypeColorHelper from '~/util/transitTypeColorHelper';
import TransitType from '~/enums/transitType';
import NodeType from '~/enums/nodeType';
import VectorGridLayer from './VectorGridLayer';
import * as s from './NetworkLayers.scss';

enum GeoserverLayer {
    Node = 'solmu',
    Link = 'linkki',
    Point = 'piste',
}

interface INetworkLayersProps {
    mapStore?: MapStore;
    networkStore?: NetworkStore;
    nodeStore?: NodeStore;
    linkStore?: LinkStore;
    routePathStore?: RoutePathStore;
    toolbarStore?: ToolbarStore;
}

interface ILinkProperties {
    lnkverkko: string;
    date_ranges?: string;
    lnkalkusolmu: string;
    lnkloppusolmu: string;
}

interface INodeProperties {
    transittypes: string;
    date_ranges?: string;
    soltyyppi: string;
    soltunnus: string;
}

function getGeoServerUrl(layerName: string) {
    const GEOSERVER_URL = process.env.GEOSERVER_URL || 'http://localhost:8080/geoserver';
    // tslint:disable-next-line:max-line-length
    return `${GEOSERVER_URL}/gwc/service/tms/1.0.0/joremapui%3A${layerName}@jore_EPSG%3A900913@pbf/{z}/{x}/{y}.pbf`;
}

@inject('mapStore', 'networkStore', 'nodeStore', 'linkStore', 'routePathStore', 'toolbarStore')
@observer
class NetworkLayers extends Component<INetworkLayersProps> {
    private parseDateRangesString(dateRangesString?: string) {
        if (!dateRangesString) return undefined;
        return dateRangesString.split(',')
            .map((dr: string) => dr.split('/').map(date => Moment(date)));
    }

    private isDateInRanges(selectedDate: Moment.Moment, dateRanges?: Moment.Moment[][]) {
        return (selectedDate &&
            (!dateRanges ||
                !dateRanges.some(dr => selectedDate.isBetween(dr[0], dr[1], 'day', '[]')))
        );
    }

    private getLinkStyle = () => {
        return {
            // Layer name 'linkki' is directly mirrored from Jore through geoserver
            linkki: (properties: ILinkProperties) => {
                const { lnkverkko: transitTypeCode } = properties;
                const transitType = TransitTypeHelper
                    .convertTransitTypeCodeToTransitType(transitTypeCode);

                if (this.isNetworkElementHidden(properties)) {
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

    private getLinkPointStyle = () => {
        return {
            // Layer name 'piste' is directly mirrored from Jore through geoserver
            piste: (properties: ILinkProperties) => {
                if (this.isNetworkElementHidden(properties)) {
                    return this.getEmptyStyle();
                }
                const { lnkverkko: transitTypeCode } = properties;
                const transitType = TransitTypeHelper
                    .convertTransitTypeCodeToTransitType(transitTypeCode);
                return {
                    color: TransitTypeColorHelper.getColor(transitType),
                    radius: 1,
                };
            },
        };
    }

    private isNetworkElementHidden =
        ({
             lnkverkko: transitTypeCode,
             date_ranges: dateRangesString,
             lnkalkusolmu: startNodeId,
             lnkloppusolmu: endNodeId,
         }:ILinkProperties) => {
            const transitType = TransitTypeHelper
                .convertTransitTypeCodeToTransitType(transitTypeCode);
            const dateRanges = this.parseDateRangesString(dateRangesString);
            const selectedTransitTypes = this.props.networkStore!.selectedTransitTypes;
            const selectedDate = this.props.networkStore!.selectedDate;
            const link = !!this.props.linkStore && !!this.props.linkStore!.link ?
                this.props.linkStore!.link! : undefined;

            return Boolean(
                (!selectedTransitTypes.includes(transitType))
                || this.isDateInRanges(selectedDate, dateRanges)
                || (
                    !!link &&
                    link.startNode.id === startNodeId &&
                    link.endNode.id === endNodeId &&
                    link.transitType === transitTypeCode
                ),
            );
        }

    private getNodeStyle = () => {
        return {
            // Layer name 'solmu' is directly mirrored from Jore through geoserver
            solmu: (properties: INodeProperties) => {
                const {
                    transittypes: transitTypeCodes,
                    date_ranges: dateRangesString,
                    soltyyppi: nodeType,
                    soltunnus: nodeId,
                } = properties;
                const dateRanges = this.parseDateRangesString(dateRangesString);
                if (this.isNodeHidden(nodeId, transitTypeCodes, dateRanges)) {
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

    private isNodeHidden = (
        nodeId: string,
        transitTypeCodes: string,
        dateRanges?: Moment.Moment[][],
    ) => {
        const node = this.props.nodeStore!.node;
        if (node && node.id === nodeId) {
            return true;
        }

        const selectedTransitTypes = toJS(this.props.networkStore!.selectedTransitTypes);
        if (this.isNodePartOfLinks(transitTypeCodes)) {
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
        const selectedDate = this.props.networkStore!.selectedDate;
        return (selectedDate && this.isDateInRanges(selectedDate, dateRanges));
    }

    private isNodePartOfLinks(transitTypeCodes: string) {
        return Boolean(transitTypeCodes);
    }

    private getEmptyStyle = () => {
        return { className: s.hidden };
    }

    render() {
        const mapZoomLevel = this.props.mapStore!.zoom;
        if (mapZoomLevel <= Constants.MAP_LAYERS_MIN_ZOOM_LEVEL) {
            return null;
        }

        const selectedTransitTypes = this.props.networkStore!.selectedTransitTypes;
        const selectedDate = this.props.networkStore!.selectedDate;
        const nodeSize = this.props.networkStore!.nodeSize;

        const selectedTool = this.props.toolbarStore!.selectedTool;
        let onNetworkNodeClick: Function | undefined;
        if (selectedTool) {
            onNetworkNodeClick = selectedTool.onNetworkNodeClick ?
                selectedTool.onNetworkNodeClick : undefined;
        }

        return (
            <>
                { this.props.networkStore!.isMapLayerVisible(MapLayer.link) &&
                    <VectorGridLayer
                        selectedTransitTypes={selectedTransitTypes}
                        selectedDate={selectedDate}
                        key={GeoserverLayer.Link}
                        url={getGeoServerUrl(GeoserverLayer.Link)}
                        interactive={true}
                        vectorTileLayerStyles={this.getLinkStyle()}
                    />
                }
                { this.props.networkStore!.isMapLayerVisible(MapLayer.linkPoint) &&
                    <VectorGridLayer
                        selectedTransitTypes={selectedTransitTypes}
                        selectedDate={selectedDate}
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
                        selectedDate={selectedDate}
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
