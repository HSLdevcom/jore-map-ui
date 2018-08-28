import { inject, observer } from 'mobx-react';
import * as React from 'react';
import * as s from './sidebar.scss';
import { Route, RouteComponentProps } from 'react-router-dom';
import hslLogo from '../../assets/hsl-logo.png';
import { RouteStore } from '../../stores/routeStore';
import { LineStore } from '../../stores/lineStore';
import SidebarContent from './SidebarContent';

interface ISidebarProps extends RouteComponentProps<any>{
    routeStore?: RouteStore;
    lineStore?: LineStore;
}

interface ILinelistState {
    searchInput: string;
}

@inject('routeStore', 'lineStore')
@observer
class Sidebar extends React.Component<ISidebarProps, ILinelistState> {
    constructor(props: ISidebarProps) {
        super(props);
    }

    public render(): any {
        const handleHeaderClick = () => {
            this.props.routeStore!.clearRoutes();
            this.props.lineStore!.setSearchInput('');
            this.props.lineStore!.lineSearchVisible = true;
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
                <Route component={SidebarContent} />
            </div>
        );
    }
}

export default Sidebar;
