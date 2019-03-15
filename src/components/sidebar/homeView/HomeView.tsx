import React from 'react';
import { inject, observer } from 'mobx-react';
import { SearchStore } from '~/stores/searchStore';
import { RoutePathStore } from '~/stores/routePathStore';
import TransitType from '~/enums/transitType';
import SearchInput from '../../shared/searchView/SearchInput';
import TransitToggleButtonBar from '../../controls/TransitToggleButtonBar';
import SearchResults from '../../shared/searchView/SearchResults';
import EntityTypeToggles from './EntityTypeToggles';
import * as s from './homeView.scss';

interface IHomeViewProps{
    searchStore?: SearchStore;
    routePathStore?: RoutePathStore;
}

@inject('searchStore', 'routePathStore')
@observer
class HomeView extends React.Component<IHomeViewProps> {
    public toggleTransitType = (type: TransitType) => {
        this.props.searchStore!.toggleTransitType(type);
    }

    componentDidMount() {
        this.props.routePathStore!.clear();
    }

    render() {
        return (
            <div className={s.homeView}>
                <SearchInput/>
                <EntityTypeToggles />
                <TransitToggleButtonBar
                    toggleSelectedTransitType={this.toggleTransitType}
                    selectedTransitTypes={this.props.searchStore!.selectedTransitTypes}
                    disabled={!this.props.searchStore!.isSearchingForLines}
                    blurred={!this.props.searchStore!.isSearchingForLines}
                />
                <SearchResults />
            </div>
        );
    }
}

export default HomeView;
