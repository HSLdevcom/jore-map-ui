import * as React from 'react';
import * as s from './homeView.scss';
import LineSearch from './LineSearch';
import { RouteStore } from '../../stores/routeStore';
import { LineStore } from '../../stores/lineStore';
import { SidebarStore } from '../../stores/sidebarStore';
import { inject, observer } from 'mobx-react';
import TransitToggleButtonBar from '../controls/TransitToggleButtonBar';
import SearchResults from './SearchResults';

interface ISidebarProps {
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
                <SearchResults />
            </div>
        );
    }
}

export default HomeView;
