import * as React from 'react';
import * as s from './sidebarContent.scss';
import LineSearch from './LineSearch';
import SearchResults from './SearchResults';
import { Route, RouteComponentProps } from 'react-router';
import RoutesList from './RoutesList';
import { RouteStore } from '../../stores/routeStore';
import { LineStore } from '../../stores/lineStore';
import { SidebarStore } from '../../stores/sidebarStore';
import { inject, observer } from 'mobx-react';

interface ISidebarProps extends RouteComponentProps<any>{
    routeStore?: RouteStore;
    lineStore?: LineStore;
    sidebarStore?: SidebarStore;
}

@inject('routeStore', 'lineStore', 'sidebarStore')
@observer
class SidebarContent extends React.Component<ISidebarProps> {
    public render() {
        const isSearchResultsVisible = () => {
            return this.props.routeStore!.routes.length === 0
                    || this.props.lineStore!.searchInput !== '';
        };
        if (this.props.sidebarStore!.isLoading) {
            return (
                <div className={s.sidebarContentView}>
                    <div id={s.loader} />
                </div>
            );
        }
        return (
            <div className={s.sidebarContentView}>
                <LineSearch/>
                { isSearchResultsVisible() &&
                <Route component={SearchResults} />
                }
                <Route
                    path='/routes'
                    component={RoutesList}
                />
            </div>
        );
    }
}

export default SidebarContent;
