import React from 'react';
import { inject, observer } from 'mobx-react';
import { Route } from 'react-router';
import { RouteListStore } from '~/stores/routeListStore';
import routeBuilder from '~/routing/routeBuilder';
import subSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import { SearchStore } from '~/stores/searchStore';
import QueryParams from '~/routing/queryParams';
import TransitType from '~/enums/transitType';
import EntityTypeToggles from '../homeView/EntityTypeToggles';
import SearchInput from '../../shared/searchView/SearchInput';
import RouteList from './RouteList';
import SearchResults from '../../shared/searchView/SearchResults';
import TransitToggleButtonBar from '../../controls/TransitToggleButtonBar';
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
                    <Route component={RouteList} />
                ) : (
                    <>
                        <EntityTypeToggles />
                        <TransitToggleButtonBar
                            toggleSelectedTransitType={this.toggleTransitType}
                            selectedTransitTypes={
                                this.props.searchStore!.selectedTransitTypes
                            }
                        />
                        <SearchResults />
                    </>
                )}
            </div>
        );
    }
}

export default RouteListView;
