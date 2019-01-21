import * as React from 'react';
import classnames from 'classnames';
import * as L from 'leaflet';
import { FaAngleRight, FaAngleDown } from 'react-icons/fa';
import { inject, observer } from 'mobx-react';
import { RoutePathStore } from '~/stores/routePathStore';
import { MapStore } from '~/stores/mapStore';
import * as s from './routePathListObject.scss';

interface IRoutePathListObjectProps {
    mapStore?: MapStore;
    routePathStore?: RoutePathStore;
    headerLabel: string;
    description?: JSX.Element;
    id: string;
    objectType: ListObjectType;
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
        this.props.routePathStore!.setHighlightedObjects([this.props.id]);
    }

    private onMouseLeave = () => {
        if (!this.props.routePathStore!.isObjectHighlighted(this.props.id)) {
            this.props.routePathStore!.setHighlightedObjects([]);
        }
    }

    render() {
        const isExtended = this.props.routePathStore!.isObjectExtended(
            this.props.id,
        );
        return (
            <div
                className={s.item}
                onMouseEnter={this.onMouseEnter}
                onMouseLeave={this.onMouseLeave}
            >
                <div
                    className={
                        classnames(
                            s.itemHeader,
                            isExtended ? s.itemExtended : null,
                        )
                    }
                    onClick={this.toggleIsExtended}
                >
                    <div className={s.attributes}>
                        <div className={s.label}>
                            {this.props.headerLabel}
                            <div className={s.id}>
                                {this.props.id}
                            </div>
                        </div>
                        <div>
                            {this.props.description}
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
