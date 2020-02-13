import { inject, observer } from 'mobx-react';
import React from 'react';
import { match } from 'react-router';
import TransitType from '~/enums/transitType';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import routeBuilder from '~/routing/routeBuilder';
import subSites from '~/routing/subSites';
import { RouteListStore } from '~/stores/routeListStore';
import { SearchStore } from '~/stores/searchStore';
import TransitToggleButtonBar from '../../controls/TransitToggleButtonBar';
import SearchInput from '../../shared/searchView/SearchInput';
import SearchResults from '../../shared/searchView/SearchResults';
import EntityTypeToggles from '../homeView/EntityTypeToggles';
import RouteList from './RouteList';
import * as s from './routeListView.scss';

interface IRouteListViewProps {
    match?: match<any>;
    routeListStore?: RouteListStore;
    searchStore?: SearchStore;
}

@inject('routeListStore', 'searchStore')
@observer
class RouteListView extends React.Component<IRouteListViewProps> {
    private toggleTransitType = (type: TransitType) => {
        this.props.searchStore!.toggleTransitType(type);
    };

    componentDidUpdate() {
        if (!navigator.getQueryParam(QueryParams.routes)) {
            const homeViewLink = routeBuilder.to(subSites.home).toLink();
            navigator.goTo({ link: homeViewLink });
        }
    }

    componentWillUnmount() {
        this.props.routeListStore!.clearRouteItems();
    }

    render() {
        const routeIds = navigator.getQueryParam(QueryParams.routes) as string[];
        return (
            <div className={s.routeListView}>
                <SearchInput />
                {/* Render search container on top of routeList when needed to prevent routeList from re-rendering each time search container is shown. */}
                <div className={s.contentWrapper}>
                    {this.props.searchStore!.searchInput !== '' && (
                        <div className={s.searchContainerWrapper}>
                            <EntityTypeToggles />
                            <TransitToggleButtonBar
                                toggleSelectedTransitType={this.toggleTransitType}
                                selectedTransitTypes={this.props.searchStore!.selectedTransitTypes}
                            />
                            <SearchResults />
                        </div>
                    )}
                    <RouteList routeIds={routeIds} />
                </div>
            </div>
        );
    }
}

export default RouteListView;
