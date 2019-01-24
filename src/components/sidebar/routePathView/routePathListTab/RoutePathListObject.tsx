import React from 'react';
import classnames from 'classnames';
import * as L from 'leaflet';
import { MapStore } from '~/stores/mapStore';
import { FaAngleRight, FaAngleDown } from 'react-icons/fa';
import { inject, observer } from 'mobx-react';
import { RoutePathStore } from '~/stores/routePathStore';
import * as s from './routePathListObject.scss';

interface IRoutePathListObjectProps {
    mapStore?: MapStore;
    routePathStore?: RoutePathStore;
    headerDescription?: JSX.Element;
    headerIcon: JSX.Element;
    headerTypeName: string;
    id: string;
    objectType: ListObjectType;
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

        if (this.props.objectType === ListObjectType.Link) {
            const positions = this.props.routePathStore!.getLinkGeom(this.props.id);
            if (positions) {
                positions.forEach(pos => bounds.extend(new L.LatLng(pos[0], pos[1])));
            }
        } else {
            const position = this.props.routePathStore!.getNodeGeom(this.props.id);
            if (position) {
                position.forEach(pos => bounds.extend(new L.LatLng(pos[0], pos[1])));
            }
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
                className={s.item}
                onMouseEnter={this.onMouseEnter}
                onMouseLeave={this.onMouseLeave}
            >
                <div
                    className={
                        classnames(
                            s.itemHeader,
                            isExtended ? s.itemExtended : null,
                            this.props.objectType === ListObjectType.Node ? s.shadow : undefined,
                        )
                    }
                    onClick={this.toggleIsExtended}
                >
                    <div className={s.headerContent}>
                        <div className={s.headerIconContainer}>
                            <div className={s.headerIcon}>
                                {this.props.headerIcon}
                            </div>
                            {this.props.headerTypeName}
                        </div>
                        <div className={s.label}>
                            <div className={s.labelTypeName}>
                            {
                                this.props.objectType === ListObjectType.Link
                                    ? 'Linkin id'
                                    : 'Solmun id'
                            }
                            </div>
                            <div className={s.id}>
                                {this.props.id}
                            </div>
                        </div>
                        <div className={s.headerDescription}>
                            {this.props.headerDescription}
                        </div>
                    </div>
                    <div className={s.itemToggle}>
                        {isExtended && <FaAngleDown />}
                        {!isExtended && <FaAngleRight />}
                    </div>
                </div>
                { isExtended &&
                    <div className={s.itemContent}>
                        {this.props.children}
                    </div>
                }
            </div>
        );
    }
}

export default RoutePathListObject;
