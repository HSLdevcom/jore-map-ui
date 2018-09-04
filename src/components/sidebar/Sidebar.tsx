import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import hslLogo from '../../assets/hsl-logo.png';
import { SidebarStore } from '../../stores/sidebarStore';
import routeStore from '../../stores/routeStore';
import searchStore from '../../stores/searchStore';
import NodeWindow from './NodeView';
import RoutesView from './RoutesView';
import HomeView from './HomeView';
import * as s from './sidebar.scss';

interface ISidebarProps extends RouteComponentProps<any>{
    sidebarStore?: SidebarStore;
}

interface ILinelistState {
    searchInput: string;
}

@inject('sidebarStore')
@observer
class Sidebar extends React.Component<ISidebarProps, ILinelistState> {
    public render(): any {
        const handleHeaderClick = () => {
            routeStore!.clearRoutes();
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
                {/* TODO: Use Route path=/node instead of this "if check" */}
                { this.props.sidebarStore!.showNodeWindow ? (
                    <NodeWindow />
                ) : (
                    <Switch>
                        <Route path='/routes' component={RoutesView} />
                        <Route component={HomeView} />
                    </Switch>
                )
                }
            </div>
        );
    }
}

export default Sidebar;
