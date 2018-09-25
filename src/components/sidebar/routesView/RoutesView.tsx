import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { Route } from 'react-router';
import LineSearch from '../../shared/searchView/LineSearch';
import RoutesList from './RoutesList';
import { RouteStore } from '../../../stores/routeStore';
import { SidebarStore } from '../../../stores/sidebarStore';
import SearchResults from '../../shared/searchView/SearchResults';
import TransitToggleButtonBar from '../../controls/TransitToggleButtonBar';
import routeBuilder from '../../../routing/routeBuilder';
import subSites from '../../../routing/subSites';
import navigator from '../../../routing/navigator';
import { SearchStore } from '../../../stores/searchStore';
import QueryParams from '../../../routing/queryParams';
import * as s from './routesView.scss';
import TransitType from '../../../enums/transitType';

interface IRoutesViewProps{
    routeStore?: RouteStore;
    searchStore?: SearchStore;
    sidebarStore?: SidebarStore;
}

@inject('routeStore', 'searchStore', 'sidebarStore')
@observer
class RoutesView extends React.Component<IRoutesViewProps> {
    constructor (props: IRoutesViewProps) {
        super(props);
        this.toggleSelectedType = this.toggleSelectedType.bind(this);
    }

    public toggleSelectedType = (type: TransitType) => {
        this.props.searchStore!.toggleSelectedTypes(type);
    }

    public componentDidUpdate() {
        if (!navigator.getQueryParam(QueryParams.routes)) {
            const homeLink = routeBuilder.to(subSites.home).toLink();
            navigator.goTo(homeLink);
        }
    }

    public render() {
        return (
            <div className={s.routesView}>
                <LineSearch/>
                { this.props.searchStore!.searchInput === '' ? (
                    <Route component={RoutesList} />
                ) : (
                    <>
                        <TransitToggleButtonBar
                            toggleSelectedTypes={this.toggleSelectedType}
                            selectedTypes={this.props.searchStore!.selectedTypes}
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
