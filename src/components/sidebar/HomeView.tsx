import * as React from 'react';
import { inject, observer } from 'mobx-react';
import LineSearch from './LineSearch';
import TransitToggleButtonBar from '../controls/TransitToggleButtonBar';
import SearchResults from './SearchResults';
import { SearchStore } from '../../stores/searchStore';
import * as s from './homeView.scss';

interface ISidebarProps{
    searchStore?: SearchStore;
}

@inject('searchStore')
@observer
class HomeView extends React.Component<ISidebarProps> {
    public render() {
        return (
            <div className={s.homeView}>
                <LineSearch/>
                <TransitToggleButtonBar
                    filters={this.props.searchStore!.filters}
                />
                <SearchResults />
            </div>
        );
    }
}

export default HomeView;
