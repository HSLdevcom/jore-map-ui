import { inject, observer } from 'mobx-react';
import React from 'react';
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
            const homeLink = routeBuilder.to(subSites.home).toLink();
            navigator.goTo(homeLink);
        }
    }

    componentWillUnmount() {
        this.props.routeListStore!.clearRoutes();
    }

    render() {
        return (
            <div className={s.routeListView}>
                <SearchInput />
                {this.props.searchStore!.searchInput === '' ? (
                    <RouteList />
                ) : (
                    <>
                        <EntityTypeToggles />
                        <TransitToggleButtonBar
                            toggleSelectedTransitType={this.toggleTransitType}
                            selectedTransitTypes={this.props.searchStore!.selectedTransitTypes}
                        />
                        <SearchResults />
                    </>
                )}
            </div>
        );
    }
}

export default RouteListView;
