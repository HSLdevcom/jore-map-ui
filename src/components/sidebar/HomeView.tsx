import * as React from 'react';
import { Route, RouteComponentProps } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import LineSearch from './LineSearch';
import TransitToggleButtonBar from '../controls/TransitToggleButtonBar';
import SearchResults from './SearchResults';
import * as s from './homeView.scss';
import { SearchStore } from '../../stores/searchStore';

interface ISidebarProps extends RouteComponentProps<any>{
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
                <Route component={SearchResults} />
            </div>
        );
    }
}

export default HomeView;
