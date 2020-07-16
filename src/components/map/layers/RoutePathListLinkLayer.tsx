import 'leaflet-polylinedecorator';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { FeatureGroup, Polyline } from 'react-leaflet';
import StartNodeType from '~/enums/startNodeType';
import EventHelper, { INodeClickParams } from '~/helpers/EventHelper';
import { INode, IRoutePath } from '~/models';
import { MapFilter, MapStore } from '~/stores/mapStore';
import { IPopupProps, PopupStore } from '~/stores/popupStore';
import { RoutePathLayerListStore } from '~/stores/routePathLayerListStore';
import NavigationUtils from '~/utils/NavigationUtils';
import NodeUtils from '~/utils/NodeUtils';
import { createCoherentLinesFromPolylines } from '~/utils/geomUtils';
import Marker from './markers/Marker';
import NodeMarker from './markers/NodeMarker';
import * as s from './routePathLinkLayer.scss';
import ArrowDecorator from './utils/ArrowDecorator';

interface RoutePathListLinkLayerProps {
    internalId: string;
    routePath: IRoutePath;
    onClick: (target: any, id: string) => void;
    onMouseOver: (target: any, id: string) => void;
    onMouseOut: (target: any, id: string) => void;
    popupStore?: PopupStore;
    mapStore?: MapStore;
    routePathLayerListStore?: RoutePathLayerListStore;
}

const OPACITY_HIGHLIGHTED = 1;
const OPACITY_UNHIGHLIGHTED = 0.6;
const WEIGHT_HIGHLIGHTED = 8;
const WEIGHT_UNHIGHLIGHTED = 6;

@inject('popupStore', 'mapStore', 'routePathLayerListStore')
@observer
class RoutePathListLinkLayer extends Component<RoutePathListLinkLayerProps> {
    private layerRef: React.Ref<any>;

    constructor(props: RoutePathListLinkLayerProps) {
        super(props);
        this.layerRef = React.createRef<any>();
    }

    private openPopup = (node: INode) => () => {
        const popup: IPopupProps = {
            content: this.renderPopup(node),
            coordinates: node.coordinates,
            isCloseButtonVisible: false,
            isAutoCloseOn: true,
        };

        this.props.popupStore!.showPopup(popup);
    };

    private renderPopup = (node: INode) => (popupId: number) => {
        return (
            <div className={s.popupContainer}>
                <div onClick={this.openNode(node, popupId)} className={s.popupOption}>
                    Avaa solmunäkymässä
                </div>
            </div>
        );
    };

    private openNode = (node: INode, popupId: number) => () => {
        this.props.popupStore!.closePopup(popupId);
        NavigationUtils.openNodeView({ nodeId: node.id });
    };

    private renderRoutePathLinks = (isHighlighted: boolean) => {
        const routePath = this.props.routePath;
        const routePathLinks = routePath.routePathLinks;
        return routePathLinks.map((routePathLink) => {
            return (
                <Polyline
                    positions={routePathLink.geometry}
                    key={routePathLink.id}
                    color={routePath.color}
                    weight={isHighlighted ? WEIGHT_HIGHLIGHTED : WEIGHT_UNHIGHLIGHTED}
                    opacity={isHighlighted ? OPACITY_HIGHLIGHTED : OPACITY_UNHIGHLIGHTED}
                    onClick={this.props.onClick(this.layerRef, routePath.internalId)}
                />
            );
        });
    };
    private renderNodes = () => {
        const routePathLinks = this.props.routePath.routePathLinks;
        const triggerNodeClick = (node: INode) => () => {
            const clickParams: INodeClickParams = { node };
            EventHelper.trigger('nodeClick', clickParams);
        };

        const nodes = routePathLinks.map((routePathLink, index) => {
            const node = routePathLink.startNode;
            return this.renderNode({
                node,
                key: `${routePathLink.orderNumber}-${index}`,
                isDisabled: routePathLink.startNodeType === StartNodeType.DISABLED,
                isTimeAlignmentStop: routePathLink.startNodeTimeAlignmentStop !== '0',
                openPopup: this.openPopup(routePathLink.startNode),
                triggerNodeClick: triggerNodeClick(node),
            });
        });
        const lastRoutePathLink = routePathLinks[routePathLinks.length - 1];
        const node = lastRoutePathLink.endNode;
        nodes.push(
            this.renderNode({
                node,
                key: 'last-node',
                isDisabled: false, // Last node can't be disabled
                isTimeAlignmentStop: false, // Last node can't be a time alignment stop
                openPopup: this.openPopup(lastRoutePathLink.endNode),
                triggerNodeClick: triggerNodeClick(node),
            })
        );
        return nodes;
    };

    private renderNode = ({
        key,
        node,
        isDisabled,
        isTimeAlignmentStop,
        openPopup,
        triggerNodeClick,
    }: {
        key: string;
        node: INode;
        isDisabled: boolean;
        isTimeAlignmentStop: boolean;
        openPopup: () => void;
        triggerNodeClick: (node: INode) => void;
    }) => {
        return (
            <NodeMarker
                key={key}
                coordinates={node.coordinates}
                nodeType={node.type}
                transitTypes={node.transitTypes ? node.transitTypes : []}
                nodeLocationType={'coordinates'}
                nodeId={node.id}
                shortId={NodeUtils.getShortId(node)}
                hastusId={node.stop ? node.stop.hastusId : undefined}
                isHighlighted={this.props.mapStore!.selectedNodeId === node.id}
                isDisabled={isDisabled}
                isTimeAlignmentStop={isTimeAlignmentStop}
                onContextMenu={openPopup}
                onClick={triggerNodeClick}
            />
        );
    };

    private renderStartMarker = () => {
        const routePath = this.props.routePath;
        const color = routePath.color!;
        const routePathLinks = routePath.routePathLinks;
        if (routePathLinks.length === 0) return;
        return (
            <Marker
                latLng={routePathLinks[0].startNode.coordinates}
                color={color}
                isClickDisabled={true}
            />
        );
    };

    private renderDirectionDecoration = () => {
        if (!this.props.mapStore!.isMapFilterEnabled(MapFilter.arrowDecorator)) {
            return null;
        }

        const routePath = this.props.routePath;
        const routePathLinks = routePath.routePathLinks;
        const geoms = routePathLinks.map((routePathLink) => routePathLink.geometry);
        // TODO: instead, call RoutePathListLinkLayer with routePathLink?
        return createCoherentLinesFromPolylines(geoms).map((geom, index) => (
            <ArrowDecorator
                key={index}
                color={routePath.color}
                geometry={geom}
                onClick={this.props.onClick(this.layerRef, routePath.internalId)}
                onMouseOver={this.props.onMouseOver(this.layerRef, routePath.internalId)}
                onMouseOut={this.props.onMouseOut(this.layerRef, routePath.internalId)}
                isUpdatePrevented={true}
            />
        ));
    };

    render() {
        const routePath = this.props.routePath;
        if (!routePath.isVisible || routePath.routePathLinks.length === 0) return null;
        const isSelected =
            this.props.routePathLayerListStore!.selectedRoutePathId === routePath.internalId;
        const isHighlighted =
            this.props.routePathLayerListStore!.highlightedRoutePathId === routePath.internalId;
        return (
            <>
                <FeatureGroup
                    ref={this.layerRef}
                    onMouseOver={this.props.onMouseOver(this.layerRef, routePath.internalId)}
                    onMouseOut={this.props.onMouseOut(this.layerRef, routePath.internalId)}
                >
                    {this.renderRoutePathLinks(isSelected || isHighlighted)}
                    {isSelected && this.renderNodes()}
                    {this.renderStartMarker()}
                </FeatureGroup>
                <FeatureGroup>{this.renderDirectionDecoration()}</FeatureGroup>
            </>
        );
    }
}

export default RoutePathListLinkLayer;
