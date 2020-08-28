import L from 'leaflet';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { Polyline } from 'react-leaflet';
import EventListener, { IRoutePathLinkClickParams } from '~/helpers/EventListener';
import IRoutePathLink from '~/models/IRoutePathLink';
import { MapFilter, MapStore } from '~/stores/mapStore';
import { RoutePathLayerStore } from '~/stores/routePathLayerStore';
import ArrowDecorator from '../utils/ArrowDecorator';
import DashedLine from '../utils/DashedLine';

const DEFAULT_LINK_COLOR = '#000';
const HOVERED_LINK_COLOR = '#cfc400';
const EXTENDED_LINK_COLOR = '#007ac9';

interface IEditRoutePathLayerLinkProps {
    enableMapClickListener: () => void;
    disableMapClickListener: () => void;
    rpLink: IRoutePathLink;
    setExtendedListItem: (id: string | null) => void;
    routePathLayerStore?: RoutePathLayerStore;
    mapStore?: MapStore;
}

const EditRoutePathLayerLink = inject(
    'routePathLayerStore',
    'mapStore'
)(
    observer((props: IEditRoutePathLayerLinkProps) => {
        const renderLink = (routePathLink: IRoutePathLink) => {
            const routePathLayerStore = props.routePathLayerStore;
            const isLinkHovered = routePathLayerStore!.hoveredItemId === routePathLink.id;
            const isLinkExtended = routePathLayerStore!.extendedListItemId === routePathLink.id;
            return [
                <Polyline
                    positions={routePathLink.geometry}
                    key={`rpLink-overlay-${routePathLink.id}`}
                    color={
                        isLinkHovered
                            ? HOVERED_LINK_COLOR
                            : isLinkExtended
                            ? EXTENDED_LINK_COLOR
                            : DEFAULT_LINK_COLOR
                    }
                    weight={15}
                    opacity={isLinkHovered || isLinkExtended ? 0.6 : 0}
                    onClick={handleLinkClick(routePathLink)}
                    onMouseOver={() => onMouseOver(routePathLink.id)}
                    onMouseOut={onMouseOut}
                    interactive={true}
                />,
                <Polyline
                    positions={routePathLink.geometry}
                    key={`rpLink-${routePathLink.id}`}
                    color={DEFAULT_LINK_COLOR}
                    weight={5}
                    opacity={0.8}
                    interactive={false}
                />,
            ];
        };

        const onMouseOver = (id: string) => {
            props.routePathLayerStore!.setHoveredItemId(id);
        };

        const onMouseOut = () => {
            props.routePathLayerStore!.setHoveredItemId(null);
        };

        const handleLinkClick = (routePathLink: IRoutePathLink) => (e: L.LeafletMouseEvent) => {
            const clickParams: IRoutePathLinkClickParams = {
                routePathLinkId: routePathLink.id,
            };
            EventListener.trigger('routePathLinkClick', clickParams);
            // Prevent current click event from triggering map click listener
            props.disableMapClickListener();
            setTimeout(() => {
                props.enableMapClickListener();
            }, 1);
        };

        const renderLinkDecorator = (routePathLink: IRoutePathLink) => {
            if (!props.mapStore!.isMapFilterEnabled(MapFilter.arrowDecorator)) {
                return null;
            }

            return (
                <ArrowDecorator
                    color={DEFAULT_LINK_COLOR}
                    geometry={routePathLink.geometry}
                    onClick={handleLinkClick(routePathLink)}
                    onMouseOver={() => onMouseOver(routePathLink.id)}
                    onMouseOut={onMouseOut}
                />
            );
        };

        const renderDashedLines = (routePathLink: IRoutePathLink) => {
            return [
                <DashedLine
                    key={'startNodeDashedLine'}
                    startPoint={routePathLink.geometry[0]}
                    endPoint={routePathLink.startNode.coordinates}
                />,
                <DashedLine
                    key={'endNodeDashedLine'}
                    startPoint={routePathLink.geometry[routePathLink.geometry.length - 1]}
                    endPoint={routePathLink.endNode.coordinates}
                />,
            ];
        };

        const rpLink = props.rpLink;
        return (
            <>
                {renderLink(rpLink)}
                {renderLinkDecorator(rpLink)}
                {renderDashedLines(rpLink)}
            </>
        );
    })
);

export default EditRoutePathLayerLink;
