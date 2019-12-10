import 'leaflet-polylinedecorator';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { FeatureGroup, Polyline } from 'react-leaflet';
import StartNodeType from '~/enums/startNodeType';
import { INode, IRoutePathLink } from '~/models';
import navigator from '~/routing/navigator';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import { MapFilter, MapStore } from '~/stores/mapStore';
import { IPopupProps, PopupStore } from '~/stores/popupStore';
import EventManager, { INodeClickParams } from '~/util/EventManager';
import NodeHelper from '~/util/NodeHelper';
import { createCoherentLinesFromPolylines } from '~/util/geomHelpers';
import Marker from './markers/Marker';
import NodeMarker from './markers/NodeMarker';
import * as s from './routePathLinkLayer.scss';
import ArrowDecorator from './utils/ArrowDecorator';

interface RoutePathLinkLayerProps {
    popupStore?: PopupStore;
    mapStore?: MapStore;
    internalId: string;
    routePathLinks: IRoutePathLink[];
    onClick: (target: any) => () => void;
    onContextMenu: (routePathLinkId: string) => void;
    onMouseOver: (target: any) => () => void;
    onMouseOut: (target: any) => () => void;
    color: string;
    opacity: number;
    weight: number;
}

@inject('popupStore', 'mapStore')
@observer
class RoutePathLinkLayer extends Component<RoutePathLinkLayerProps> {
    private layerRef: React.Ref<any>;

    constructor(props: RoutePathLinkLayerProps) {
        super(props);
        this.layerRef = React.createRef<any>();
    }

    private onContextMenu = (routePathLinkId: string) => () => {
        this.props.onContextMenu(routePathLinkId);
    };

    private openPopup = (node: INode) => () => {
        const popup: IPopupProps = {
            content: this.renderPopup(node),
            coordinates: node.coordinates,
            isCloseButtonVisible: false,
            isAutoCloseOn: true
        };

        this.props.popupStore!.showPopup(popup);
    };

    private renderPopup = (node: INode) => (popupId: number) => {
        return (
            <div className={s.popupContainer}>
                <div onClick={this.openNode(node, popupId)}>Avaa kohde</div>
            </div>
        );
    };

    private openNode = (node: INode, popupId: number) => () => {
        this.props.popupStore!.closePopup(popupId);
        const nodeLink = routeBuilder
            .to(SubSites.node)
            .toTarget(':id', node.id)
            .toLink();
        navigator.goTo(nodeLink);
    };

    private renderRoutePathLinks = () => {
        const routePathLinks = this.props.routePathLinks;
        return routePathLinks.map(routePathLink => {
            return (
                <Polyline
                    positions={routePathLink.geometry}
                    key={routePathLink.id}
                    color={this.props.color}
                    weight={this.props.weight}
                    opacity={this.props.opacity}
                    onClick={this.props.onClick(this.layerRef)}
                    onContextMenu={this.onContextMenu(routePathLink.id)}
                />
            );
        });
    };
    private renderNodes = () => {
        const routePathLinks = this.props.routePathLinks;
        const triggerNodeClick = (node: INode) => () => {
            const clickParams: INodeClickParams = { node };
            EventManager.trigger('nodeClick', clickParams);
        };

        const nodes = routePathLinks.map((routePathLink, index) => {
            const node = routePathLink.startNode;
            return this.renderNode({
                node,
                key: `${routePathLink.orderNumber}-${index}`,
                isDisabled: routePathLink.startNodeType === StartNodeType.DISABLED,
                isTimeAlignmentStop: routePathLink.startNodeTimeAlignmentStop !== '0',
                openPopup: this.openPopup(routePathLink.startNode),
                triggerNodeClick: triggerNodeClick(node)
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
                triggerNodeClick: triggerNodeClick(node)
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
        triggerNodeClick
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
                nodeLocationType={'coordinates'}
                nodeId={node.id}
                shortId={NodeHelper.getShortId(node)}
                hastusId={node.stop ? node.stop.hastusId : undefined}
                isSelected={this.props.mapStore!.selectedNodeId === node.id}
                isDisabled={isDisabled}
                isTimeAlignmentStop={isTimeAlignmentStop}
                onContextMenu={openPopup}
                onClick={triggerNodeClick}
            />
        );
    };

    private renderStartMarker = () => {
        const color = this.props.color;
        const routePathLinks = this.props.routePathLinks;
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

        const routePathLinks = this.props.routePathLinks;

        const geoms = routePathLinks.map(routePathLink => routePathLink.geometry);

        return createCoherentLinesFromPolylines(geoms).map((geom, index) => (
            <ArrowDecorator
                key={index}
                color={this.props.color}
                geometry={geom}
                onClick={this.props.onClick(this.layerRef)}
                onMouseOver={this.props.onMouseOver(this.layerRef)}
                onMouseOut={this.props.onMouseOut(this.layerRef)}
                isUpdatePrevented={true}
            />
        ));
    };

    render() {
        if (this.props.routePathLinks.length === 0) return null;

        return (
            <>
                <FeatureGroup
                    ref={this.layerRef}
                    onMouseOver={this.props.onMouseOver(this.layerRef)}
                    onMouseOut={this.props.onMouseOut(this.layerRef)}
                >
                    {this.renderRoutePathLinks()}
                    {this.renderNodes()}
                    {this.renderStartMarker()}
                </FeatureGroup>
                <FeatureGroup>{this.renderDirectionDecoration()}</FeatureGroup>
            </>
        );
    }
}

export default RoutePathLinkLayer;
