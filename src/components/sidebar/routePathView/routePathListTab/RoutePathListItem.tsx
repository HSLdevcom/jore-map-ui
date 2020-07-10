import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { MapStore } from '~/stores/mapStore';
import { RoutePathLayerStore } from '~/stores/routePathLayerStore';
import * as s from './routePathListItem.scss';

interface IRoutePathListItemProps {
    id: string;
    reference: React.RefObject<HTMLDivElement>;
    header: JSX.Element;
    body: JSX.Element;
    isItemHighlighted?: boolean;
    shadowClass?: string;
    listIcon?: JSX.Element;
    isLastNode?: boolean;
    isFirstNode?: boolean;
    mapStore?: MapStore;
    routePathLayerStore?: RoutePathLayerStore;
}

@inject('routePathStore', 'routePathLayerStore', 'mapStore')
@observer
class RoutePathListItem extends React.Component<IRoutePathListItemProps> {
    private onMouseEnter = () => {
        this.props.routePathLayerStore!.setHighlightedListItemId(this.props.id);
    };

    private onMouseLeave = () => {
        if (this.props.routePathLayerStore!.hoveredItemId === this.props.id) {
            this.props.routePathLayerStore!.setHighlightedListItemId(null);
        }
    };

    render() {
        const isExtended = this.props.routePathLayerStore!.extendedListItemId === this.props.id;
        const isFirstNode = this.props.isFirstNode;
        const isLastNode = this.props.isLastNode;
        const isItemHighlighted = this.props.isItemHighlighted;
        return (
            <div
                ref={this.props.reference}
                className={classnames(
                    s.routePathListItem,
                    this.props.shadowClass,
                    isItemHighlighted ? s.highlightedItem : undefined
                )}
            >
                <div
                    className={s.contentBorder}
                    onMouseEnter={this.onMouseEnter}
                    onMouseLeave={this.onMouseLeave}
                >
                    <div className={s.borderContainer}>
                        <div className={!isFirstNode ? s.borderLeftContainer : undefined} />
                        <div />
                    </div>
                    {this.props.listIcon && <div className={s.listIcon}>{this.props.listIcon}</div>}
                    <div className={s.borderContainer}>
                        <div className={!isLastNode ? s.borderLeftContainer : undefined} />
                        <div />
                    </div>
                </div>
                <div className={s.contentWrapper}>
                    {this.props.header}
                    {isExtended && <div className={s.itemContent}>{this.props.body}</div>}
                </div>
            </div>
        );
    }
}

export default RoutePathListItem;
