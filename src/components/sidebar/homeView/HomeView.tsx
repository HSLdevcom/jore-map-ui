import * as React from 'react';
import { inject, observer } from 'mobx-react';
import LineSearch from '../../shared/searchView/LineSearch';
import TransitToggleButtonBar from '../../controls/TransitToggleButtonBar';
import SearchResults from '../../shared/searchView/SearchResults';
import { SearchStore } from '../../../stores/searchStore';
import * as s from './homeView.scss';

interface ISidebarProps{
    searchStore?: SearchStore;
}

@inject('searchStore')
@observer
class HomeView extends React.Component<ISidebarProps> {
    private setFiltersFunction = (filters: string[]): void => {
        this.props.searchStore!.filters = filters;
    }
    public render() {
        return (
            <div className={s.homeView}>
                <LineSearch/>
                <TransitToggleButtonBar
                    setFiltersFunction={this.setFiltersFunction}
                    filters={this.props.searchStore!.filters}
                />
                <SearchResults />
            </div>
        );
    }
}

export default HomeView;
