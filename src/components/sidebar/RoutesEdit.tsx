import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { RouteStore } from '../../stores/routeStore';
import { Checkbox, TransitToggleButtonBar } from '../controls';
import { IRoute } from '../../models';
import RouteShow from './RouteShow';
import LineSearch from './LineSearch';
import * as s from './routesEdit.scss';

interface IRoutesEditState {
    networkCheckboxToggles: any;
    lineSearchVisible: boolean;
}

interface IRoutesEditProps {
    routeStore?: RouteStore;
}

@inject('routeStore')
@observer
class RoutesEdit extends
React.Component<IRoutesEditProps, IRoutesEditState> {
    constructor(props: any) {
        super(props);
        this.state = {
            networkCheckboxToggles: {
                solmut: false,
                linkit: false,
            },
            lineSearchVisible: false,
        };
    }

    private routeList(routes: IRoute[]) {
        return routes.map((route: IRoute) => {
            return (
                <RouteShow
                    key={route.lineId}
                    route={route}
                />
            );
        });
    }

    private networkCheckboxToggle = (type: string) => {
        const newToggleState: object = this.state.networkCheckboxToggles;
        newToggleState[type] = !this.state.networkCheckboxToggles[type];
        this.setState({
            networkCheckboxToggles: newToggleState,
        });
    }

    private onSearchInputChange = (newValue: string) => {
        this.setState({
            lineSearchVisible: Boolean(newValue),
        });
    }

    public render(): any {
        return (
            <div className={s.routesEditView}>
                <LineSearch
                    showSearchResults={this.state.lineSearchVisible}
                    onInputChange={this.onSearchInputChange}
                />
                { !this.state.lineSearchVisible &&
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
                }
            </div>
        );
    }
}

export default RoutesEdit;
