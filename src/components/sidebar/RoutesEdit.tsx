import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { RouteStore } from '../../stores/routeStore';
import { Checkbox, TransitToggleButtonBar } from '../controls';
import { IRoute } from '../../models';
import RouteShow from './RouteShow';
import * as s from './routesEdit.scss';
import { RouteComponentProps } from 'react-router-dom';
import RouteService from '../../services/routeService';
import { toJS } from 'mobx';

interface MatchParams {
    route: string;
}

interface IRoutesEditState {
    networkCheckboxToggles: any;
}

interface IRoutesEditProps extends RouteComponentProps<MatchParams>{
    routeStore?: RouteStore;
}

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
        const routeList = () => {
            if (this.props.routeStore!.routes.length < 1) return null;
            return this.props.routeStore!.routes.map((route: IRoute) => {
                return (
                    <RouteShow
                        key={route.lineId}
                        route={toJS(route)}
                    />
                );
            });
        };
        if (routesLoading) {
            return (
                <div id={s.loader} />
            );
        }
        return (
            <span className={s.routesEdit}>
                {
                    routeList()
                    // routeList(this.props.match.path)
                }
                <div className={s.checkboxContainer}>
                    <input
                        type='checkbox'
                        checked={false}
                    />
                    Kopioi reitti toiseen suuntaan
                </div>
                <div className={s.inputWrapper}>
                    <div className={s.inputContainer}>
                        <label className={s.inputTitle}>
                            HAE TOINEN LINJA TARKASTELUUN
                        </label>
                        <input
                            placeholder='Hae reitti'
                            type='text'
                        />
                    </div>
                    <div className={s.inputContainer}>
                        <span className={s.inputTitle}>TARKASTELUPÄIVÄ</span>
                        <input
                            placeholder='25.8.2017'
                            type='text'
                        />
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
            </span>
        );
    }
}

export default RoutesEdit;
