import { inject, observer } from 'mobx-react';
import React from 'react';
import { Button } from '~/components/controls';
import TransitTypeLink from '~/components/shared/TransitTypeLink';
import ButtonType from '~/enums/buttonType';
import { IRoute } from '~/models';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import { LineStore } from '~/stores/lineStore';
import { LoginStore } from '~/stores/loginStore';
import { SearchStore } from '~/stores/searchStore';
import NavigationUtils from '~/utils/NavigationUtils';
import s from './lineRoutesTab.scss';

interface ILineRoutesTabProps {
    lineStore?: LineStore;
    searchStore?: SearchStore;
    loginStore?: LoginStore;
}

@inject('lineStore', 'searchStore', 'loginStore')
@observer
class LineRoutesTab extends React.Component<ILineRoutesTabProps> {
    private redirectToNewRouteView = () => {
        const line = this.props.lineStore!.line;
        console.log(line)
        const newRouteViewLink = routeBuilder
            .to(SubSites.newRoute)
            .set(QueryParams.lineId, line!.id)
            .toLink();

        console.log(newRouteViewLink)
        navigator.goTo({ link: newRouteViewLink });
    };

    private renderRouteList = (routes: IRoute[]) => {
        const line = this.props.lineStore!.line;

        return routes.map((route: IRoute, index: number) => {
            return (
                <div
                    key={index}
                    className={s.routeListItem}
                    onClick={this.redirectToRouteView(route.id)}
                >
                    <TransitTypeLink
                        transitType={line!.transitType!}
                        shouldShowTransitTypeIcon={true}
                        text={route.id}
                        hoverText={''}
                    />
                    <div className={s.routeName} title={route.routeName}>
                        {route.routeName}
                    </div>
                </div>
            );
        });
    };

    private redirectToRouteView = (routeId: string) => () => {
        this.props.searchStore!.setSearchInput('');
        NavigationUtils.openRouteView({ routeId, queryValues: navigator.getQueryParamValues() });
    };

    private openAllRoutes = () => {
        const routes = this.props.lineStore!.routes;
        const routesLinkBuilder = routeBuilder.to(SubSites.routes);
        routes.forEach((route) => {
            routesLinkBuilder.append(QueryParams.routes, route.id);
        });
        const routesLink = routesLinkBuilder.toLink();
        this.props.searchStore!.setSearchInput('');
        navigator.goTo({
            link: routesLink,
        });
    };

    render() {
        const lineStore = this.props.lineStore!;
        const line = lineStore.line;
        const routes = lineStore.routes;
        if (!line) return null;

        return (
            <div className={s.lineRoutesTabView} data-cy='lineRoutesTabView'>
                <div className={s.content}>
                    {routes.length === 0 ? (
                        <div>Linjalla ei olemassa olevia reittejä.</div>
                    ) : (
                        this.renderRouteList(routes)
                    )}

                    {this.props.loginStore!.hasWriteAccess && (
                        <Button
                            onClick={this.redirectToNewRouteView}
                            className={s.createRouteButton}
                            type={ButtonType.SQUARE}
                        >
                            {`Luo uusi reitti linjalle ${line.id}`}
                        </Button>
                    )}
                    {routes.length > 0 && (
                        <Button
                            onClick={this.openAllRoutes}
                            type={ButtonType.SQUARE}
                        >{`Avaa reitit (${routes.length})`}</Button>
                    )}
                </div>
            </div>
        );
    }
}

export default LineRoutesTab;
