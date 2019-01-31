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
    headerIcon: JSX.Element;
    headerContent: string | React.ReactElement<HTMLDivElement>;
    headerTypeName: string;
    objectType: ListObjectType;
    reference: React.RefObject<HTMLDivElement>;
    id: string;
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
                positions.forEach(pos => bounds.extend(pos));
            }
        } else {
            const position = this.props.routePathStore!.getNodeGeom(this.props.id);
            if (position) {
                position.forEach(pos => bounds.extend(pos));
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
                className={classnames(
                    s.item,
                    this.props.objectType === ListObjectType.Node ? s.shadow : undefined,
                )}
                onMouseEnter={this.onMouseEnter}
                onMouseLeave={this.onMouseLeave}
            >
                <div className={s.headerIcon}>
                    {this.props.headerIcon}
                </div>
                <div
                    className={
                        classnames(
                            s.itemHeader,
                            isExtended ? s.itemExtended : null,
                        )
                    }
                    onClick={this.toggleIsExtended}
                >
                    <div className={s.headerContent}>
                        <div className={s.headerIconContainer}>
                            {this.props.headerTypeName}
                        </div>
                        <div className={s.label}>
                            {this.props.headerContent}
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
