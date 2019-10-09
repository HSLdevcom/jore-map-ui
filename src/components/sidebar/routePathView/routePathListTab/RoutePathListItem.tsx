import React from 'react';
import classnames from 'classnames';
import * as L from 'leaflet';
import { inject, observer } from 'mobx-react';
import { MapStore } from '~/stores/mapStore';
import { RoutePathStore } from '~/stores/routePathStore';
import * as s from './routePathListItem.scss';

interface IRoutePathListItemProps {
    mapStore?: MapStore;
    routePathStore?: RoutePathStore;
    id: string;
    geometry: L.LatLng[];
    shadowClass?: string;
    header: JSX.Element;
    body: JSX.Element;
    listIcon: JSX.Element;
    reference: React.RefObject<HTMLDivElement>;
}

@inject('routePathStore', 'mapStore')
@observer
class RoutePathListItem extends React.Component<IRoutePathListItemProps> {
    private toggleIsExtended = () => {
        this.props.routePathStore!.toggleExtendedListItem(this.props.id);

        if (this.props.routePathStore!.isListItemExtended(this.props.id)) {
            this.props.mapStore!.setMapBounds(this.getBounds());
        }
    };

    private getBounds = () => {
        const bounds: L.LatLngBounds = new L.LatLngBounds([]);
        this.props.geometry.forEach((geom: L.LatLng) => bounds.extend(geom));
        return bounds;
    };

    private onMouseEnter = () => {
        this.props.routePathStore!.setListHighlightedNodeIds([this.props.id]);
    };

    private onMouseLeave = () => {
        if (
            this.props.routePathStore!.listHighlightedNodeIds.includes(
                this.props.id
            )
        ) {
            this.props.routePathStore!.setListHighlightedNodeIds([]);
        }
    };

    render() {
        const isExtended = this.props.routePathStore!.isListItemExtended(
            this.props.id
        );
        return (
            <div
                ref={this.props.reference}
                className={classnames(s.item, this.props.shadowClass)}
                onMouseEnter={this.onMouseEnter}
                onMouseLeave={this.onMouseLeave}
            >
                <div className={s.listIcon}>{this.props.listIcon}</div>
                <div onClick={this.toggleIsExtended}>{this.props.header}</div>
                {isExtended && (
                    <div className={s.itemContent}>{this.props.body}</div>
                )}
            </div>
        );
    }
}

export default RoutePathListItem;
