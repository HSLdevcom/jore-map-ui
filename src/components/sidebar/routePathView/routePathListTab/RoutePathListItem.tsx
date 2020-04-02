import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { MapStore } from '~/stores/mapStore';
import { RoutePathStore } from '~/stores/routePathStore';
import * as s from './routePathListItem.scss';

interface IRoutePathListItemProps {
    mapStore?: MapStore;
    routePathStore?: RoutePathStore;
    id: string;
    header: JSX.Element;
    body: JSX.Element;
    isItemHighlighted?: boolean;
    shadowClass?: string;
    listIcon?: JSX.Element;
    isLastNode?: boolean;
    isFirstNode?: boolean;
}

@inject('routePathStore', 'mapStore')
@observer
class RoutePathListItem extends React.Component<IRoutePathListItemProps> {
    private onMouseEnter = () => {
        this.props.routePathStore!.setListHighlightedNodeIds([this.props.id]);
    };

    private onMouseLeave = () => {
        if (this.props.routePathStore!.listHighlightedNodeIds.includes(this.props.id)) {
            this.props.routePathStore!.setListHighlightedNodeIds([]);
        }
    };

    render() {
        const isExtended = this.props.routePathStore!.isListItemExtended(this.props.id);
        const isFirstNode = this.props.isFirstNode;
        const isLastNode = this.props.isLastNode;
        const isItemHighlighted = this.props.isItemHighlighted;
        return (
            <div
                className={classnames(
                    s.routePathListItem,
                    this.props.shadowClass,
                    isItemHighlighted ? s.highlightedItem : undefined
                )}
                onMouseEnter={this.onMouseEnter}
                onMouseLeave={this.onMouseLeave}
            >
                <div className={s.contentBorder}>
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
