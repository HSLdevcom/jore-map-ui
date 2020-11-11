import * as L from 'leaflet';
import { uniq } from 'lodash';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { Marker as LeafletMarker } from 'react-leaflet';
import TransitType from '~/enums/transitType';
import { INodeMapHighlight, ISearchNode } from '~/models/INode';
import { IPopupProps, PopupStore } from '~/stores/popupStore';
import NodeHighlightColor from '~/types/NodeHighlightColor';
import LeafletUtils from '~/utils/leafletUtils';
import { ISelectNetworkEntityPopupData } from '../popups/SelectNetworkEntityPopup';
import * as s from './clusterNodeMarker.scss';

interface IClusterNodeMarkerProps {
    coordinates: L.LatLng;
    nodes: ISearchNode[];
    onLeftClickMarkerItem: Function;
    onRightClickMarkerItem: Function;
    onContextMenu?: Function;
    popupStore?: PopupStore;
}

const ClusterNodeMarker = inject('popupStore')(
    observer((props: IClusterNodeMarkerProps) => {
        const getTransitTypeClassName = () => {
            let transitTypes: TransitType[] = [];
            props.nodes.forEach((node) => (transitTypes = transitTypes.concat(node.transitTypes)));
            transitTypes = uniq(transitTypes);
            if (transitTypes.includes(TransitType.TRAM)) {
                return s.tram;
            }
            if (transitTypes.includes(TransitType.TRAIN)) {
                return s.train;
            }
            if (transitTypes.includes(TransitType.SUBWAY)) {
                return s.subway;
            }
            if (transitTypes.includes(TransitType.FERRY)) {
                return s.ferry;
            }
            if (transitTypes.includes(TransitType.BUS)) {
                return s.bus;
            }
            return s.unusedStop;
        };
        const renderNodeMarkerIcon = () => {
            const iconWidth = 14;
            return LeafletUtils.createDivIcon({
                html: <div className={s.clusterNodeMarkerContainer}>{props.nodes.length}</div>,
                options: {
                    iconWidth,
                    classNames: [s.node, s.clusterNodeMarker, getTransitTypeClassName()],
                    popupOffset: -15,
                    iconHeight: iconWidth,
                },
            });
        };

        const onMarkerClick = (e: L.LeafletEvent) => {
            const popupData: ISelectNetworkEntityPopupData = {
                nodes: props.nodes as INodeMapHighlight[],
                links: [],
            };
            const popup: IPopupProps = {
                type: 'selectNetworkEntityPopup',
                data: popupData,
                coordinates: props.coordinates,
                isCloseButtonVisible: true,
                isAutoCloseOn: false,
                hasOpacity: true,
            };
            props.popupStore!.showPopup(popup);
        };

        return (
            <LeafletMarker
                onClick={onMarkerClick}
                icon={renderNodeMarkerIcon()}
                position={props.coordinates}
                interactive={true}
            ></LeafletMarker>
        );
    })
);

export default ClusterNodeMarker;

export { NodeHighlightColor };
