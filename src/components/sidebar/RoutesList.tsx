import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { RouteStore } from '../../stores/routeStore';
import { LineStore } from '../../stores/lineStore';
import { Checkbox, TransitToggleButtonBar } from '../controls';
import { IRoute } from '../../models';
import RouteShow from './RouteShow';
import * as s from './routesList.scss';
import { RouteComponentProps } from 'react-router-dom';
import RouteService from '../../services/routeService';
import Loader from './Loader';
import routeBuilderProvider from '../../routing/routeBuilderProvider';

interface MatchParams {
    route: string;
}

interface IRoutesListState {
    networkCheckboxToggles: any;
    isLoading: boolean;
}

interface IRoutesListProps extends RouteComponentProps<MatchParams>{
    lineStore?: LineStore;
    routeStore?: RouteStore;
}

@inject('lineStore', 'routeStore')
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
        this.props.lineStore!.setSearchInput('');
    }

    private networkCheckboxToggle = (type: string) => {
        const newToggleState: object = this.state.networkCheckboxToggles;
        newToggleState[type] = !this.state.networkCheckboxToggles[type];
        this.setState({
            networkCheckboxToggles: newToggleState,
        });
    }

    private async queryRoutes() {
        this.setState({ isLoading: true });
        const routeIds = routeBuilderProvider.getValue('routes');
        if (routeIds) {
            this.props.routeStore!.routes = await RouteService.getRoutes(routeIds);
        }
        this.setState({ isLoading: false });
    }

    public componentDidUpdate() {
        if (
            !this.state.isLoading &&
            routeBuilderProvider.getValue('routes') &&
            routeBuilderProvider.getValue('routes').length
                !== this.props.routeStore!.routes.length
            ) {
            if (!this.state.isLoading) {
                this.queryRoutes();
            }
        }
    }

    public render(): any {
        const routeList = (routes: IRoute[]) => {
            let visibleRoutePathsIndex = 0;
            if (this.props.routeStore!.routes.length < 1) return null;
            return this.props.routeStore!.routes.map((route: IRoute) => {
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
                    <div className={s.checkboxContainer}>
                        <input
                            type='checkbox'
                            checked={false}
                        />
                        Kopioi reitti toiseen suuntaan
                    </div>
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
