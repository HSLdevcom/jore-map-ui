import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { RouteStore } from '../../stores/routeStore';
import TransitToggleButtonBar from '../controls/TransitToggleButtonBar';
import { IRoute } from '../../models';
import RouteShow from './RouteShow';
import * as s from './routesEdit.scss';

interface IRoutesEditProps {
    routeStore?: RouteStore;
}

@inject('routeStore')
@observer
class RoutesEdit extends React.Component<IRoutesEditProps> {
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

    public render(): any {
        return (
            <span className={s.routesEdit}>
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
                        <input
                            type='checkbox'
                            checked={false}
                        />
                        Hae alueen linkit
                    </div>
                    <div className={s.checkboxContainer}>
                        <input
                            type='checkbox'
                            checked={false}
                        />
                        Hae alueen solmut
                    </div>
                </div>
            </span>
        );
    }
}

export default RoutesEdit;
