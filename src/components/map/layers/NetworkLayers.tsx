import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { toJS } from 'mobx';
import Moment from 'moment';
import { NetworkStore, NodeSize } from '~/stores/networkStore';
import { EditNetworkStore } from '~/stores/editNetworkStore';
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
    editNetworkStore?: EditNetworkStore;
    routePathStore?: RoutePathStore;
    toolbarStore?: ToolbarStore;
}

interface ILinkProperties {
    lnkverkko: string;
    dateranges?: string;
    lnkalkusolmu: string;
    lnkloppusolmu: string;
}

interface INodeProperties {
    transittypes: string;
    dateranges?: string;
    soltyyppi: string;
    soltunnus: string;
}

function getGeoServerUrl(layerName: string) {
    const GEOSERVER_URL = process.env.GEOSERVER_URL || 'http://localhost:8080/geoserver';
    // tslint:disable-next-line:max-line-length
    return `${GEOSERVER_URL}/gwc/service/tms/1.0.0/joremapui%3A${layerName}@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf`;
}

@inject('networkStore', 'editNetworkStore', 'routePathStore', 'toolbarStore')
@observer
class NetworkLayers extends Component<INetworkLayersProps> {
    private parseDaterangesString(daterangesString?: string) {
        if (!daterangesString) return undefined;
        return daterangesString.split(',')
            .map((dr: string) => dr.split('/').map(date => Moment(date)));
    }

    private isDateInRanges(selectedDate: Moment.Moment, dateranges?: Moment.Moment[][]) {
        return (selectedDate &&
            (!dateranges ||
                !dateranges.some(dr => selectedDate.isBetween(dr[0], dr[1], 'day', '[]')))
        );
    }

    private getLinkStyle = () => {
        return {
            // Layer name 'linkki' is directly mirrored from Jore through geoserver
            linkki: (properties: ILinkProperties, zoom: number) => {
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
            piste: (properties: ILinkProperties, zoom: number) => {
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
             dateranges: daterangesString,
             lnkalkusolmu: startNodeId,
             lnkloppusolmu: endNodeId,
         }:ILinkProperties) => {
            const transitType = TransitTypeHelper
                .convertTransitTypeCodeToTransitType(transitTypeCode);
            const dateranges = this.parseDaterangesString(daterangesString);
            const selectedTransitTypes = this.props.networkStore!.selectedTransitTypes;
            const selectedDate = this.props.networkStore!.selectedDate;
            const node = this.props.editNetworkStore!.node;
            return Boolean(
                (!selectedTransitTypes.includes(transitType))
                || this.isDateInRanges(selectedDate, dateranges)
                || (node && (node.id === startNodeId || node.id === endNodeId)));
        }

    private getNodeStyle = () => {
        return {
            // Layer name 'solmu' is directly mirrored from Jore through geoserver
            solmu: (properties: INodeProperties, zoom: number) => {
                const {
                    transittypes: transitTypeCodes,
                    dateranges: daterangesString,
                    soltyyppi: nodeType,
                    soltunnus: nodeId,
                } = properties;
                const dateranges = this.parseDaterangesString(daterangesString);
                if (this.isNodeHidden(nodeId, transitTypeCodes, dateranges)) {
                    return this.getEmptyStyle();
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

    private isNodeHidden = (
        nodeId: string,
        transitTypeCodes: string,
        dateranges?: Moment.Moment[][],
    ) => {
        const node = this.props.editNetworkStore!.node;
        if (node && node.id === nodeId) {
            return true;
        }
        if (transitTypeCodes) {
            const selectedTransitTypes = toJS(this.props.networkStore!.selectedTransitTypes);
            const nodeTransitTypes = TransitTypeHelper
                .convertTransitTypeCodesToTransitTypes(transitTypeCodes.split(','));
            if (!selectedTransitTypes.some(type => nodeTransitTypes.includes(type))) {
                return true;
            }
        }
        const selectedDate = this.props.networkStore!.selectedDate;
        return (selectedDate && this.isDateInRanges(selectedDate, dateranges));
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
        const selectedDate = this.props.networkStore!.selectedDate;
        const nodeSize = this.props.networkStore!.nodeSize;

        const selectedTool = this.props.toolbarStore!.selectedTool;
        let onNetworkNodeClick: Function;
        if (selectedTool) {
            onNetworkNodeClick = selectedTool.onNetworkNodeClick ?
            selectedTool.onNetworkNodeClick : () => {};
        }

        return (
            <>
                { this.props.networkStore!.isLinksVisible &&
                    <VectorGridLayer
                        selectedTransitTypes={selectedTransitTypes}
                        selectedDate={selectedDate}
                        key={GeoserverLayer.Link}
                        url={getGeoServerUrl(GeoserverLayer.Link)}
                        interactive={true}
                        vectorTileLayerStyles={this.getLinkStyle()}
                    />
                }
                { this.props.networkStore!.isPointsVisible &&
                    <VectorGridLayer
                        selectedTransitTypes={selectedTransitTypes}
                        selectedDate={selectedDate}
                        key={GeoserverLayer.Point}
                        url={getGeoServerUrl(GeoserverLayer.Point)}
                        interactive={true}
                        vectorTileLayerStyles={this.getLinkPointStyle()}
                    />
                }
                { (this.props.networkStore!.isNodesVisible) &&
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
