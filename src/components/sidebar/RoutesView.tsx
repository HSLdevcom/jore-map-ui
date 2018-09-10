import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { Route, RouteComponentProps } from 'react-router-dom';
import LineSearch from './LineSearch';
import RoutesList from './RoutesList';
import { RouteStore } from '../../stores/routeStore';
import { SidebarStore } from '../../stores/sidebarStore';
import SearchResults from './SearchResults';
import TransitToggleButtonBar from '../controls/TransitToggleButtonBar';
import { SearchStore } from '../../stores/searchStore';
import * as s from './routesView.scss';

interface ISidebarProps extends RouteComponentProps<any>{
    routeStore?: RouteStore;
    searchStore?: SearchStore;
    sidebarStore?: SidebarStore;
}

@inject('routeStore', 'searchStore', 'sidebarStore')
@observer
class RoutesView extends React.Component<ISidebarProps> {
    public render() {
        return (
            <div className={s.routesView}>
                <LineSearch/>
                { this.props.searchStore!.searchInput === '' ? (
                    <Route component={RoutesList} />
                ) : (
                    <>
                        <TransitToggleButtonBar filters={[]}/>
                        <Route component={SearchResults} />
                    </>
                )
                }
            </div>
        );
    }
}

export default RoutesView;
