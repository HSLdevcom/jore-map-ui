import * as React from 'react';
import { Route, RouteComponentProps } from 'react-router';
import { inject, observer } from 'mobx-react';
import LineSearch from './LineSearch';
import { RouteStore } from '../../stores/routeStore';
import { LineStore } from '../../stores/lineStore';
import { SidebarStore } from '../../stores/sidebarStore';
import TransitToggleButtonBar from '../controls/TransitToggleButtonBar';
import SearchResults from './SearchResults';
import * as s from './homeView.scss';

interface ISidebarProps extends RouteComponentProps<any>{
    routeStore?: RouteStore;
    lineStore?: LineStore;
    sidebarStore?: SidebarStore;
}

@inject('routeStore', 'lineStore', 'sidebarStore')
@observer
class HomeView extends React.Component<ISidebarProps> {
    public render() {
        return (
            <div className={s.homeView}>
                <LineSearch/>
                <TransitToggleButtonBar
                    filters={this.props.lineStore!.filters || []}
                />
                <Route component={SearchResults} />
            </div>
        );
    }
}

export default HomeView;
