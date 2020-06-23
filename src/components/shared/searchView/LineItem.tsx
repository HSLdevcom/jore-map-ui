import classNames from 'classnames';
import React from 'react';
import ISearchLine from '~/models/searchModels/ISearchLine';
import ISearchLineRoute from '~/models/searchModels/ISearchLineRoute';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import searchStore from '~/stores/searchStore';
import NavigationUtils from '~/utils/NavigationUtils';
import TransitTypeUtils from '~/utils/TransitTypeUtils';
import TransitTypeLink from '../TransitTypeLink';
import * as s from './lineItem.scss';

interface ILineItemProps {
    line: ISearchLine;
}

class LineItem extends React.Component<ILineItemProps> {
    private openRoute = (routeId: string) => () => {
        searchStore.setSearchInput('');
        NavigationUtils.openRouteView({ routeId, queryValues: navigator.getQueryParamValues() });
    };

    private renderRoute(route: ISearchLineRoute): any {
        return (
            <div
                key={route.id}
                className={classNames(
                    s.routeItem,
                    TransitTypeUtils.getColorClass(this.props.line.transitType),
                    !route.isUsedByRoutePath ? s.inactiveRouteItem : undefined
                )}
                data-cy='routeItem'
                onClick={this.openRoute(route.id)}
            >
                <div>{route.id}</div>
                <div>{route.name}</div>
            </div>
        );
    }

    private openAllRoutes = () => {
        const routesLinkBuilder = routeBuilder.to(SubSites.routes);
        this.props.line.routes.forEach((route) => {
            routesLinkBuilder.append(QueryParams.routes, route.id);
        });
        const routesLink = routesLinkBuilder.toLink();
        searchStore.setSearchInput('');
        navigator.goTo({
            link: routesLink,
        });
    };

    render() {
        return (
            <div className={s.lineItemView}>
                <div className={s.lineContainer}>
                    <TransitTypeLink
                        transitType={this.props.line.transitType}
                        shouldShowTransitTypeIcon={true}
                        text={this.props.line.id}
                        onClick={() => NavigationUtils.openLineView({ lineId: this.props.line.id })}
                        hoverText={''}
                        data-cy='lineItem'
                    />
                    {this.props.line.routes.length > 0 && (
                        <div
                            className={s.openAllRoutesButton}
                            onClick={this.openAllRoutes}
                            data-cy='openAllRoutesButton'
                        >
                            Avaa reitit ({this.props.line.routes.length})
                        </div>
                    )}
                </div>
                {this.props.line.routes
                    .slice()
                    .sort((a, b) => (a.id < b.id ? -1 : 1))
                    .map((route) => this.renderRoute(route))}
            </div>
        );
    }
}

export default LineItem;
