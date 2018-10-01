import * as React from 'react';
import { inject, observer } from 'mobx-react';
import LineSearch from '../../shared/searchView/LineSearch';
import TransitToggleButtonBar from '../../controls/TransitToggleButtonBar';
import SearchResults from '../../shared/searchView/SearchResults';
import { SearchStore } from '../../../stores/searchStore';
import * as s from './homeView.scss';
import TransitType from '../../../enums/transitType';

interface IHomeViewProps{
    searchStore?: SearchStore;
}

@inject('searchStore')
@observer
class HomeView extends React.Component<IHomeViewProps> {
    public toggleSelectedType = (type: TransitType) => {
        this.props.searchStore!.toggleTransitType(type);
    }

    public render() {
        return (
            <div className={s.homeView}>
                <LineSearch/>
                <TransitToggleButtonBar
                    toggleSelectedTypes={this.toggleSelectedType}
                    selectedTypes={this.props.searchStore!.selectedTypes}
                />
                <SearchResults />
            </div>
        );
    }
}

export default HomeView;
