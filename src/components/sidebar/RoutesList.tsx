import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { RouteStore } from '../../stores/routeStore';
import searchStore from '../../stores/searchStore';
import { Checkbox, TransitToggleButtonBar } from '../controls';
import { IRoute } from '../../models';
import RouteShow from './RouteShow';
import * as s from './routesList.scss';
import RouteService from '../../services/routeService';
import Loader from './Loader';
import QueryParams from '../../routing/queryParams';
import navigator from '../../routing/navigator';

interface IRoutesListState {
    networkCheckboxToggles: any;
    isLoading: boolean;
}

interface IRoutesListProps {
    routeStore?: RouteStore;
}

@inject('routeStore')
@observer
class RoutesList extends React.Component<IRoutesListProps, IRoutesListState> {
    constructor(props: any) {
        super(props);
        this.state = {
            networkCheckboxToggles: {
                solmut: false,
                linkit: false,
            },
            isLoading: false,
        };
    }

    async componentDidMount() {
        await this.queryRoutes();
        searchStore!.setSearchInput('');
    }

    private networkCheckboxToggle = (type: string) => {
        const newToggleState: object = this.state.networkCheckboxToggles;
        newToggleState[type] = !this.state.networkCheckboxToggles[type];
        this.setState({
            networkCheckboxToggles: newToggleState,
        });
    }

    private async queryRoutes() {
        const routeIds = navigator.getQueryParam(QueryParams.routes);
        if (routeIds) {
            this.setState({ isLoading: true });
            this.props.routeStore!.routes = await RouteService.getRoutes(routeIds);
            this.setState({ isLoading: false });
        }
    }

    public render(): any {
        const routeList = (routes: IRoute[]) => {
            let visibleRoutePathsIndex = 0;
            if (routes.length < 1) return null;
            return routes.map((route: IRoute) => {
                const routeShow = (
                    <RouteShow
                        key={route.routeId}
                        route={route}
                        visibleRoutePathsIndex={visibleRoutePathsIndex}
                    />
                );
                visibleRoutePathsIndex += route.routePaths.filter(
                    x => x.visible).length;
                return routeShow;
            });
        };
        if (this.state.isLoading) {
            return(
                <div className={s.routesListView}>
                    <Loader/>
                </div>
            );
        }
        return (
            <div className={s.routesListView}>
                <div className={s.routeList}>
                    {
                        routeList(this.props.routeStore!.routes)
                    }
                </div>
                <div className={s.network}>
                    <label className={s.inputTitle}>VERKKO</label>
                    <TransitToggleButtonBar filters={[]} />
                    <div className={s.checkboxContainer}>
                        <Checkbox
                            onClick={this.networkCheckboxToggle.bind(this, 'linkit')}
                            checked={this.state.networkCheckboxToggles.linkit}
                            text={'Hae alueen linkit'}
                        />
                    </div>
                    <div className={s.checkboxContainer}>
                        <Checkbox
                            onClick={this.networkCheckboxToggle.bind(this, 'solmut')}
                            checked={this.state.networkCheckboxToggles.solmut}
                            text={'Hae alueen solmut'}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default RoutesList;
