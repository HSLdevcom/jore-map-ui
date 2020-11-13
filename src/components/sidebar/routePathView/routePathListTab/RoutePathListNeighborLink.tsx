import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { getNeighborLinkColor } from '~/components/map/layers/edit/RoutePathNeighborLinkLayer';
import { INeighborLink } from '~/models';
import * as s from './routePathListItem.scss';

interface IRoutePathListNeighborLinkProps {
    neighborLink: INeighborLink;
    isNeighborLinkHighlighted: boolean;
}

const RoutePathListNeighborLink = inject()(
    observer((props: IRoutePathListNeighborLinkProps) => {
        return (
            <div className={s.routePathListItem}>
                <div className={s.listIconWrapper}>
                    <div className={s.borderContainer}>
                        <div
                            className={classnames(s.neighborBorderLeftHeight, s.neighborBorderLeft)}
                            style={{
                                borderColor: getNeighborLinkColor(
                                    props.neighborLink,
                                    props.isNeighborLinkHighlighted
                                ),
                            }}
                        ></div>
                        <div></div>
                    </div>
                </div>
                <div className={s.contentWrapper}></div>
            </div>
        );
    })
);

export default RoutePathListNeighborLink;
