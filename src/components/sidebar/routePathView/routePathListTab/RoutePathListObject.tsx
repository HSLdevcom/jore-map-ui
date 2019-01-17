import * as React from 'react';
import classnames from 'classnames';
import * as L from 'leaflet';
import { FaAngleRight, FaAngleDown } from 'react-icons/fa';
import { inject, observer } from 'mobx-react';
import { RoutePathStore } from '~/stores/routePathStore';
import MapExposer from '~/components/map/MapExposer';
import * as s from './routePathListObject.scss';

interface IRoutePathListObjectProps {
    routePathStore?: RoutePathStore;
    headerDescription?: JSX.Element;
    headerIcon: JSX.Element;
    headerTypeName: string;
    id: string;
    objectType: ListObjectType;
}

interface IRoutePathListObjectState {
    isExtended: boolean;
}

export enum ListObjectType {
    Node,
    Link,
}

@inject('routePathStore')
@observer
class RoutePathListObject
    extends React.Component<IRoutePathListObjectProps, IRoutePathListObjectState> {
    constructor(props: IRoutePathListObjectProps) {
        super(props);

        this.state = {
            isExtended: false,
        };
    }

    private toggleIsExtended = () => {
        const extending = !this.state.isExtended;
        this.setState({
            isExtended: !this.state.isExtended,
        });

        if (extending) {
            this.onExtending();
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

    private onExtending = () => {
        MapExposer.fitBounds(
            this.getBounds(),
        );
    }

    private onMouseEnter = () => {
        if (this.props.objectType === ListObjectType.Link) {
            this.props.routePathStore!.setHighlightedLinks([this.props.id]);
        } else {
            this.props.routePathStore!.setHighlightedNodes([this.props.id]);
        }
    }

    private onMouseLeave = () => {
        if (!this.state.isExtended) {
            this.props.routePathStore!.setHighlightedLinks([]);
            this.props.routePathStore!.setHighlightedNodes([]);
        }
    }

    render() {
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
                            this.state.isExtended ? s.itemExtended : null,
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
                        {this.state.isExtended && <FaAngleDown />}
                        {!this.state.isExtended && <FaAngleRight />}
                    </div>
                </div>
                { this.state.isExtended &&
                    <div className={s.itemContent}>
                        {this.props.children}
                    </div>
                }
            </div>
        );
    }
}

export default RoutePathListObject;
