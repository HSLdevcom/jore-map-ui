import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { RouteStore } from '../../stores/routeStore';
import { LineStore } from '../../stores/lineStore';
import { Checkbox, TransitToggleButtonBar } from '../controls';
import { IRoute } from '../../models';
import RouteShow from './RouteShow';
import LineSearch from './LineSearch';
import * as s from './routesEdit.scss';
import { Route, RouteComponentProps } from 'react-router-dom';
import RouteService from '../../services/routeService';
import { toJS } from 'mobx';

interface MatchParams {
    route: string;
}

interface IRoutesEditState {
    networkCheckboxToggles: any;
}

interface IRoutesEditProps extends RouteComponentProps<MatchParams>{
    lineStore?: LineStore;
    routeStore?: RouteStore;
}

@inject('lineStore')
@inject('routeStore')
@observer
class RoutesEdit extends React.Component<IRoutesEditProps, IRoutesEditState> {
    constructor(props: any) {
        super(props);
        this.state = {
            networkCheckboxToggles: {
                solmut: false,
                linkit: false,
            },
        };
        this.props.lineStore!.lineSearchVisible = false;
    }

    async componentWillMount() {
        this.props.routeStore!.routeLoading = true;
        try {
            const route = await RouteService.getRoute(this.props.match.params.route);
            this.props.routeStore!.clearRoutes();
            this.props.routeStore!.addToRoutes(route);
            this.props.routeStore!.routeLoading = false;
        } catch (err) { // TODO Handle errors?
        }
    }

    private networkCheckboxToggle = (type: string) => {
        const newToggleState: object = this.state.networkCheckboxToggles;
        newToggleState[type] = !this.state.networkCheckboxToggles[type];
        this.setState({
            networkCheckboxToggles: newToggleState,
        });
    }

    public render(): any {
        const routesLoading = this.props.routeStore!.routeLoading;
        const routeList = (routes: IRoute[]) => {
            let visibleRoutePathsIndex = 0;
            if (this.props.routeStore!.routes.length < 1) return null;
            return this.props.routeStore!.routes.map((route: IRoute) => {
                const routeShow = (
                    <RouteShow
                        key={route.routeId}
                        route={toJS(route)}
                        visibleRoutePathsIndex={visibleRoutePathsIndex}
                    />
                );
                const routePathsAmount = route.routePaths.filter(
                    x => x.visible).length;
                visibleRoutePathsIndex += routePathsAmount;

                return routeShow;
            });
        };
        if (routesLoading) {
            return (
                <div id={s.loader} />
            );
        }
        console.log(this.props.match);
        return (
            <div className={s.routesEditView}>
                <Route component={LineSearch} />
                { !this.props.lineStore!.lineSearchVisible &&
                <div className={s.wrapper}>
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
                }
            </div>
        );
    }
}

export default RoutesEdit;
