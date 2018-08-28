import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { RouteStore } from '../../stores/routeStore';
import { LineStore } from '../../stores/lineStore';
import RouteService from '../../services/routeService';
import LineService from '../../services/lineService';
import LineSearch from './LineSearch';
import RouteList from './RouteList';
import SearchResults from './SearchResults';
import * as s from './sidebar.scss';

interface MatchParams {
    route: string;
}

interface ISidebarProps {
    routeStore?: RouteStore;
}

interface ILinelistState {
    searchInput: string;
}

interface ISidebarProps extends RouteComponentProps<MatchParams>{
    routeStore?: RouteStore;
    lineStore?: LineStore;
}

@inject('routeStore')
@inject('lineStore')
@observer
class Sidebar extends React.Component<ISidebarProps, ILinelistState> {
    constructor(props: ISidebarProps) {
        super(props);
    }

    componentDidMount() {
        if (this.props.location.pathname === '/') {
            this.queryAllLines();
        } else {
            this.queryRoutes(this.props.location.search);
        }
    }

    componentWillReceiveProps(props: any) {
        if (props.location.pathname === '/') {
            this.queryAllLines();
        } else {
            this.queryRoutes(props.location.search);
        }
    }

    async queryAllLines() {
        try {
            await this.props.lineStore!.setAllLines(await LineService.getAllLines());
        } catch (err) {
            // TODO: show error on screen that the query failed
        }
    }

    private queryRoutes(searchQuery: string) {
        this.props.lineStore!.setSearchInput('');
        const routeIds = searchQuery.replace('?routeIds=', '').split(',');
        const routes = this.props.routeStore!.routes;
        routeIds.map(async (routeId) => {
            try {
                const existingRoute = routes.find((route) => {
                    return route.routeId === routeId;
                });
                if (!existingRoute) {
                    const route = await RouteService.getRoute(routeId.toString());
                    this.props.routeStore!.addToRoutes(route);
                }
                // TODO: set sidebarStore.isLoading = false;
            } catch (err) {
                // TODO: show error on screen that the query failed
            }
        });
    }

    public handleHeaderClick = () => {
        this.props.routeStore!.clearRoutes();
        this.props.lineStore!.setSearchInput('');
        this.props.history.push('/');
    }

    private isSearchResultsVisible() {
        return this.props.routeStore!.routes.length === 0
        || this.props.lineStore!.searchInput !== '';
    }

    private isRouteListVisible() {
        return this.props.routeStore!.routes.length > 0
        && this.props.lineStore!.searchInput === '';
    }

    public render(): any {
        return (
            <div className={s.sidebarView}>
                <div className={s.header}>
                    <div onClick={this.handleHeaderClick} className={s.headerContainer}>
                        <img className={s.logo} src='hsl-logo.png' />
                        <h2 className={s.title}>
                            Joukkoliikennerekisteri
                </h2>
                    </div>
                </div>
                <div className={s.content}>
                    <LineSearch />
                    { this.isSearchResultsVisible() &&
                        <SearchResults
                            location={this.props.location}
                        />
                    }
                    { this.isRouteListVisible() &&
                        <RouteList />
                    }
                    {/* TODO: add <Loading /> component here */}
                </div>
            </div>
        );
    }
}

export default Sidebar;
