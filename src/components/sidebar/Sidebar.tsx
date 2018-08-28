import * as React from 'react';
import RoutesEdit from './RoutesEdit';
import LineSearch from './LineSearch';
import * as s from './sidebar.scss';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import hslLogo from '../../assets/hsl-logo.png';
import observableRouteStore from '../../stores/routeStore';
import observableLineStore from '../../stores/lineStore';

interface ISidebarProps  extends RouteComponentProps<any>{
}

interface ILinelistState {
    searchInput: string;
}

class Sidebar extends React.Component<ISidebarProps, ILinelistState> {
    constructor(props: ISidebarProps) {
        super(props);
    }

    public render(): any {
        const handleHeaderClick = () => {
            observableRouteStore.clearRoutes();
            observableLineStore.lineSearchVisible = true;
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
                <div className={s.content}>
                    <Switch>
                        <Route
                            path='/routes/'
                            component={RoutesEdit}
                        />
                        <Route
                            component={LineSearch}
                        />
                    </Switch>
                </div>
            </div>
        );
    }
}

export default Sidebar;
