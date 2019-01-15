import * as React from 'react';
import classnames from 'classnames';
import { FaAngleRight, FaAngleDown } from 'react-icons/fa';
import { inject, observer } from 'mobx-react';
import { RoutePathStore } from '~/stores/routePathStore';
import * as s from './routePathListObject.scss';

interface IRoutePathListObjectProps {
    routePathStore?: RoutePathStore;
    headerLabel: string;
    description?: JSX.Element;
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
        } else {
            this.onCollapsing();
        }
    }

    private onExtending = () => {

    }

    private onCollapsing = () => {

    }

    private onMouseEnter = () => {
        if (!this.state.isExtended) {
            if (this.props.objectType === ListObjectType.Link) {
                this.props.routePathStore!.setHighlightedLinks([this.props.id]);
            } else {
                this.props.routePathStore!.setHighlightedNodes([this.props.id]);
            }
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
