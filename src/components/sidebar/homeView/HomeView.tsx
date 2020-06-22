import { inject, observer } from 'mobx-react';
import React from 'react';
import { Checkbox } from '~/components/controls';
import TransitType from '~/enums/transitType';
import navigator from '~/routing/navigator';
import RouteBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import { MapStore } from '~/stores/mapStore';
import { RoutePathStore } from '~/stores/routePathStore';
import { SearchStore } from '~/stores/searchStore';
import TransitToggleButtonBar from '../../controls/TransitToggleButtonBar';
import SearchInput from '../../shared/searchView/SearchInput';
import SearchResults from '../../shared/searchView/SearchResults';
import EntityTypeToggles from './EntityTypeToggles';
import * as s from './homeView.scss';

interface IHomeViewProps {
    searchStore?: SearchStore;
    routePathStore?: RoutePathStore;
    mapStore?: MapStore;
}

@inject('searchStore', 'routePathStore', 'mapStore')
@observer
class HomeView extends React.Component<IHomeViewProps> {
    public toggleTransitType = (type: TransitType) => {
        this.props.searchStore!.toggleTransitType(type);
    };

    componentDidMount() {
        this.props.routePathStore!.clear();
        this.props.mapStore!.initCoordinates();
    }

    private redirectToNewLineView = () => {
        const newLineViewLink = RouteBuilder.to(SubSites.newLine).toLink();
        navigator.goTo({ link: newLineViewLink });
    };

    private toggleShowActiveLines = () => {
        // TODO
    };

    render() {
        return (
            <div className={s.homeView}>
                <SearchInput />
                <EntityTypeToggles />
                <div className={s.toggleActiveLinesContainer}>
                    <Checkbox
                        content='Näytä vain aktiiviset linjat'
                        checked={true}
                        onClick={this.toggleShowActiveLines}
                    />
                </div>
                <TransitToggleButtonBar
                    toggleSelectedTransitType={this.toggleTransitType}
                    selectedTransitTypes={this.props.searchStore!.selectedTransitTypes}
                    disabled={!this.props.searchStore!.isSearchingForLines}
                    blurred={!this.props.searchStore!.isSearchingForLines}
                />
                <SearchResults />
                <div className={s.largeButton} onClick={this.redirectToNewLineView}>
                    Luo uusi linja
                </div>
            </div>
        );
    }
}

export default HomeView;
