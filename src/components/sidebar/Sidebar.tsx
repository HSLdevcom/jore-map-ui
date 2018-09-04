import { inject, observer } from 'mobx-react';
import * as React from 'react';
import * as s from './sidebar.scss';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import hslLogo from '../../assets/hsl-logo.png';
import { RouteStore } from '../../stores/routeStore';
import searchStore from '../../stores/searchStore';
import RoutesView from './RoutesView';
import HomeView from './HomeView';

interface ISidebarProps extends RouteComponentProps<any>{
    routeStore?: RouteStore;
}

interface ILinelistState {
    searchInput: string;
}

@inject('routeStore')
@observer
class Sidebar extends React.Component<ISidebarProps, ILinelistState> {
    public render(): any {
        const handleHeaderClick = () => {
            this.props.routeStore!.clearRoutes();
            searchStore.setSearchInput('');
            this.props.history.push('/');
        };
        return (
            <div className={s.sidebarView}>
                <div className={s.header}>
                    <div onClick={handleHeaderClick} className={s.headerContainer}>
                        <img className={s.logo} src={hslLogo} />
                        <h2 className={s.title}>
                            Joukkoliikennerekisteri
                </h2>
                    </div>
                </div>
                <Switch>
                    <Route path='/routes' component={RoutesView} />
                    <Route component={HomeView} />
                </Switch>
            </div>
        );
    }
}

export default Sidebar;
