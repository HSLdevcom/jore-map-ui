import { observer } from 'mobx-react';
import Moment from 'moment';
import React, { Component } from 'react';
import { IRoutePath } from '~/models';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import routeBuilder from '~/routing/routeBuilder';
import subSites from '~/routing/subSites';
import RoutePathLinkLayer from './RoutePathLinkLayer';

interface RoutePathLayerProps {
    toggleHighlight: (internalId: string) => (target: any) => () => void;
    hoverHighlight: (internalId: string) => (target: any) => () => void;
    hoverHighlightOff: (internalId: string) => (target: any) => () => void;
    hasHighlight: Function;
    routePaths: IRoutePath[];
}

@observer
class RoutePathLayer extends Component<RoutePathLayerProps> {
    private openLinkView = (routePath: IRoutePath) => (routePathLinkId: string) => {
        const routePathViewLink = routeBuilder
            .to(subSites.routePath)
            .toTarget(
                ':id',
                [
                    routePath.routeId,
                    Moment(routePath.startTime).format('YYYY-MM-DDTHH:mm:ss'),
                    routePath.direction
                ].join(',')
            )
            .append(QueryParams.showItem, routePathLinkId)
            .toLink();
        navigator.goTo(routePathViewLink);
    };

    render() {
        return this.props.routePaths.map((routePath, index) => {
            if (!routePath.visible) return;
            const internalId = routePath.internalId;
            return (
                <RoutePathLinkLayer
                    key={routePath.internalId}
                    internalId={internalId}
                    onClick={this.props.toggleHighlight(internalId)}
                    onContextMenu={this.openLinkView(routePath)}
                    onMouseOver={this.props.hoverHighlight(internalId)}
                    onMouseOut={this.props.hoverHighlightOff(internalId)}
                    routePathLinks={routePath.routePathLinks}
                    color={routePath.color!}
                    opacity={this.props.hasHighlight(internalId) ? 1 : 0.6}
                    weight={this.props.hasHighlight(internalId) ? 8 : 6}
                />
            );
        });
    }
}

export default RoutePathLayer;
