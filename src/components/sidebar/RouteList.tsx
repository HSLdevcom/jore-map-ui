import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { RouteStore } from '../../stores/routeStore';
import { LineStore } from '../../stores/lineStore';
import { Checkbox, TransitToggleButtonBar } from '../controls';
import { IRoute } from '../../models';
import RouteShow from './RouteShow';
import * as s from './routeList.scss';

interface IRouteListState {
    networkCheckboxToggles: any;
}

interface IRouteListProps {
    lineStore?: LineStore;
    routeStore?: RouteStore;
}

@inject('lineStore')
@inject('routeStore')
@observer
class RouteList extends
React.Component<IRouteListProps, IRouteListState> {
    constructor(props: any) {
        super(props);
        this.state = {
            networkCheckboxToggles: {
                solmut: false,
                linkit: false,
            },
        };
    }

    private routeList(routes: IRoute[]) {
        let visibleRoutePathsIndex = 0;
        return routes.map((route: IRoute) => {
            const routeShow = (
                <RouteShow
                    key={route.routeId}
                    route={route}
                    visibleRoutePathsIndex={visibleRoutePathsIndex}
                />
            );

            const routePathsAmount = route.routePaths.filter(
                x => x.visible).length;
            visibleRoutePathsIndex += routePathsAmount;

            return routeShow;
        });
    }

    private networkCheckboxToggle = (type: string) => {
        const newToggleState: object = this.state.networkCheckboxToggles;
        newToggleState[type] = !this.state.networkCheckboxToggles[type];
        this.setState({
            networkCheckboxToggles: newToggleState,
        });
    }

    public render(): any {
        return (
            <div className={s.routesEditView}>
                <div className={s.wrapper}>
                    <div className={s.routeList}>
                        {
                            this.routeList(this.props.routeStore!.routes)
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
            </div>
        );
    }
}

export default RouteList;
