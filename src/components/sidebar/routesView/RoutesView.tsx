import React from 'react';
import { inject, observer } from 'mobx-react';
import { Route } from 'react-router';
import { RouteStore } from '~/stores/routeStore';
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
import * as s from './routesView.scss';

interface IRoutesViewProps{
    routeStore?: RouteStore;
    searchStore?: SearchStore;
}

@inject('routeStore', 'searchStore')
@observer
class RoutesView extends React.Component<IRoutesViewProps> {
    private toggleTransitType = (type: TransitType) => {
        this.props.searchStore!.toggleTransitType(type);
    }

    componentDidUpdate() {
        if (!navigator.getQueryParam(QueryParams.routes)) {
            const homeLink = routeBuilder.to(subSites.home).toLink();
            navigator.goTo(homeLink);
        }
    }

    render() {
        return (
            <div className={s.routesView}>
                <SearchInput/>
                { this.props.searchStore!.searchInput === '' ? (
                    <Route component={RouteList} />
                ) : (
                    <>
                        <EntityTypeToggles />
                        <TransitToggleButtonBar
                            toggleSelectedTransitType={this.toggleTransitType}
                            selectedTransitTypes={this.props.searchStore!.selectedTransitTypes}
                        />
                        <SearchResults />
                    </>
                )
                }
            </div>
        );
    }
}

export default RoutesView;
