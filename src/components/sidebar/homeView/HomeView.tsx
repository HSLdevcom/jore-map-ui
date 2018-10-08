import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { SearchStore } from '~/stores/searchStore';
import TransitType from '~/enums/transitType';
import LineSearch from '../../shared/searchView/LineSearch';
import TransitToggleButtonBar from '../../controls/TransitToggleButtonBar';
import SearchResults from '../../shared/searchView/SearchResults';
import * as s from './homeView.scss';

interface IHomeViewProps{
    searchStore?: SearchStore;
}

@inject('searchStore')
@observer
class HomeView extends React.Component<IHomeViewProps> {
    public toggleTransitType = (type: TransitType) => {
        this.props.searchStore!.toggleTransitType(type);
    }

    public render() {
        return (
            <div className={s.homeView}>
                <LineSearch/>
                <TransitToggleButtonBar
                    toggleSelectedTransitType={this.toggleTransitType}
                    selectedTransitTypes={this.props.searchStore!.selectedTransitTypes}
                />
                <SearchResults />
            </div>
        );
    }
}

export default HomeView;
