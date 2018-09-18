import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { Route, Switch } from 'react-router';
import { Location } from 'history';
import classnames from 'classnames';
import hslLogo from '../../assets/hsl-logo.png';
import { SidebarStore } from '../../stores/sidebarStore';
import { RouteStore } from '../../stores/routeStore';
import { SearchStore } from '../../stores/searchStore';
import { MapStore } from '../../stores/mapStore';
import LinkView from './LinkView';
import NodeView from './NodeView';
import RoutesView from './RoutesView';
import HomeView from './HomeView';
import routeBuilder  from '../../routing/routeBuilder';
import subSites from '../../routing/subSites';
import navigator from '../../routing/navigator';
import * as s from './sidebar.scss';

// Requiring location to force update on location change
// This is due to blocked updates issue
// tslint:disable-next-line
// https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/guides/blocked-updates.md
interface ISidebarProps{
    sidebarStore?: SidebarStore;
    routeStore?: RouteStore;
    searchStore?: SearchStore;
    mapStore?: MapStore;
    location: Location;
}

interface ILinelistState {
    searchInput: string;
}

@inject('sidebarStore', 'routeStore', 'searchStore', 'mapStore')
@observer
class Sidebar extends React.Component<ISidebarProps, ILinelistState> {
    public render(): any {
        const goToHomeView = () => {
            this.props.routeStore!.clearRoutes();
            this.props.searchStore!.setSearchInput('');
            const homeLink = routeBuilder.to(subSites.home).clear().toLink();
            navigator.goTo(homeLink);
        };

        return (
            <div
                className={classnames(
                    s.sidebarView,
                )}
            >
                <div className={s.header}>
                    <div onClick={goToHomeView} className={s.headerContainer}>
                        <img className={s.logo} src={hslLogo} />
                        <h2 className={s.title}>
                            Joukkoliikennerekisteri
                </h2>
                    </div>
                </div>
                {/* TODO: Use Route path=/node instead of this "if check" */}
                <Switch>
                    <Route path={subSites.routes} component={RoutesView} />
                    <Route path={subSites.node} component={NodeView} />
                    <Route path={subSites.link} component={LinkView} />
                    <Route path={subSites.home} component={HomeView} />
                </Switch>
            </div>
        );
    }
}

export default Sidebar;
