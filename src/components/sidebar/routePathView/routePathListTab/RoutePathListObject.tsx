import React from 'react';
import classnames from 'classnames';
import * as L from 'leaflet';
import { inject, observer } from 'mobx-react';
import { MapStore } from '~/stores/mapStore';
import { RoutePathStore } from '~/stores/routePathStore';
import * as s from './routePathListObject.scss';

interface IRoutePathListObjectProps {
    mapStore?: MapStore;
    routePathStore?: RoutePathStore;
    id: string;
    getGeometry: Function;
    hasShadow: boolean;
    header: JSX.Element;
    body: JSX.Element;
    listIcon: JSX.Element;
    reference: React.RefObject<HTMLDivElement>;
}

export enum ListObjectType {
    Node,
    Link,
}

@inject('routePathStore', 'mapStore')
@observer
class RoutePathListObject
    extends React.Component<IRoutePathListObjectProps> {
    private toggleIsExtended = () => {
        this.props.routePathStore!.toggleExtendedObject(this.props.id);

        if (this.props.routePathStore!.isObjectExtended(this.props.id)) {
            this.props.mapStore!.setMapBounds(
                this.getBounds(),
            );
        }
    }

    private getBounds = () => {
        const bounds:L.LatLngBounds = new L.LatLngBounds([]);
        const positions = this.props.getGeometry(this.props.id);
        if (positions) {
            positions.forEach((pos: any) => bounds.extend(pos));
        }
        return bounds;
    }

    private onMouseEnter = () => {
        this.props.routePathStore!.setHighlightedObject(this.props.id);
    }

    private onMouseLeave = () => {
        if (this.props.routePathStore!.isObjectHighlighted(this.props.id)) {
            this.props.routePathStore!.setHighlightedObject(null);
        }
    }

    render() {
        const isExtended = this.props.routePathStore!.isObjectExtended(
            this.props.id,
        );
        return (
            <div
                ref={this.props.reference}
                className={classnames(
                    s.item,
                    this.props.hasShadow ? s.shadow : undefined,
                )}
                onMouseEnter={this.onMouseEnter}
                onMouseLeave={this.onMouseLeave}
            >
                <div className={s.headerIcon}>
                    {this.props.listIcon}
                </div>
                <div onClick={this.toggleIsExtended}>
                    {this.props.header}
                </div>
                { isExtended &&
                    <div className={s.itemContent}>
                        {this.props.body}
                    </div>
                }
            </div>
        );
    }
}

export default RoutePathListObject;
