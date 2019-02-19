import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { IRoutePath } from '~/models';
import routeBuilder  from '~/routing/routeBuilder';
import subSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import RoutePathLinkLayer from './RoutePathLinkLayer';

interface RoutePathLayerProps {
    toggleHighlight: (internalId: string) => (target: any) => () => void;
    hoverHighlight: (internalId: string) => (target: any) => () => void;
    hoverHighlightOff: (target: any) => () => void;
    hasHighlight: Function;
    routePaths: IRoutePath[];
}

@observer
class RoutePathLayer extends Component<RoutePathLayerProps> {
    private openLinkView = (routePathLinkId: string) => {
        const linkViewLink = routeBuilder
            .to(subSites.routelink)
            .toTarget(routePathLinkId)
            .toLink();
        navigator.goTo(linkViewLink);
    }

    render() {
        return this.props.routePaths
            .map((routePath, index) => {
                if (!routePath.visible) return;
                const internalId = routePath.internalId;
                return (
                    <RoutePathLinkLayer
                        key={routePath.internalId}
                        internalId={internalId}
                        onClick={this.props.toggleHighlight(internalId)}
                        onContextMenu={this.openLinkView}
                        onMouseOver={this.props.hoverHighlight(internalId)}
                        onMouseOut={this.props.hoverHighlightOff}
                        routePathLinks={routePath.routePathLinks!}
                        color={routePath.color!}
                        opacity={this.props.hasHighlight(internalId) ? 1 : 0.6}
                        weight={this.props.hasHighlight(internalId) ? 8 : 7}
                    />
                );
            });
    }
}

export default RoutePathLayer;
