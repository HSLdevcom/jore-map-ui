import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { RouteStore } from '../../stores/routeStore';
import TransitToggleButtonBar from '../controls/TransitToggleButtonBar';
import { IRoute } from '../../models';
import ToggleButton from '../controls/ToggleButton';
import classNames from 'classnames';
import LineHelper from '../../util/lineHelper';
import TransitTypeColorHelper from '../../util/transitTypeColorHelper';
import * as s from './lineEditView.scss';

interface ILineEditViewState {
    type: string;
}

interface ILineEditViewProps {
    routeStore?: RouteStore;
}

@inject('routeStore')
@observer
class LineEditView extends React.Component<ILineEditViewProps, ILineEditViewState> {

    private toggleDirection = () => {
        // TODO
    }

    public render(): any {
        return (
            <span className={s.lineEditView}>
                {this.props.routeStore!.openRoutes.map((route: IRoute) => {
                    return (
                        <div className={s.line} key={route.lineId}>
                            <span>
                                {LineHelper.getTransitIcon(route.line.transitType, false)}
                                <span
                                    className={
                                        classNames(
                                            s.label,
                                            TransitTypeColorHelper.getColorClass(
                                                route.line.transitType,
                                                false,
                                            ),
                                        )
                                    }
                                >
                                    {route.line.lineNumber}
                                </span>
                                {route.routeName}
                            </span>
                            <div className={s.toggle}>
                                <span className={s.toggleTitle}>suunta 1 </span>
                                <ToggleButton
                                    onClick={this.toggleDirection}
                                    type={route.line.transitType}
                                />
                            </div>
                            <div className={s.checkboxContainer}>
                                <input
                                    type='checkbox'
                                    checked={false}
                                />
                                Kopioi reitti toiseen suuntaan
                            </div>
                        </div>
                    );
                })
                }
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

export default LineEditView;
