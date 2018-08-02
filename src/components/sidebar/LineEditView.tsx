import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { RouteStore } from '../../stores/routeStore';
import TransitToggleButtonBar from '../controls/TransitToggleButtonBar';
import { IRoute } from '../../models';
import ToggleButton from '../controls/ToggleButton';
import LineHelper from '../../util/lineHelper';
import classNames from 'classnames';
import {
    container,
    line,
    toggle,
    toggleTitle,
    checkboxContainer,
    inputContainer,
    inputTitle,
    network,
    networkContainer,
    bus,
    ferry,
    label,
    subway,
    train,
    tram,
} from './lineEditView.scss';
import TransitType from '../../enums/transitType';

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

    private getType = (type: TransitType) => {
        switch (type) {
        case TransitType.BUS:
            return classNames(label, bus);
        case TransitType.FERRY:
            return classNames(label, ferry);
        case TransitType.SUBWAY:
            return classNames(label, subway);
        case TransitType.TRAM:
            return classNames(label, tram);
        case TransitType.TRAIN:
            return classNames(label, train);
        default:
            return classNames(label, bus);
        }
    }

    public render(): any {
        return (
            <span className={container}>
                {this.props.routeStore!.openRoutes.map((route: IRoute) => {
                    return (
                        <div className={line} key={route.lineId}>
                            <span>
                                {LineHelper.getTransitIcon(route.line.transitType, false)}
                                <span className={this.getType(route.line.transitType)}>
                                    {route.line.lineNumber}
                                </span>
                                {route.routeName}
                            </span>
                            <div className={toggle}>
                                <span className={toggleTitle}>suunta 1 </span>
                                <ToggleButton
                                    onClick={this.toggleDirection}
                                    type={route.line.transitType}
                                />
                            </div>
                            <div className={checkboxContainer}>
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
                <div className={inputContainer}>
                    <label className={inputTitle}>
                        HAE TOINEN LINJA TARKASTELUUN
                    </label>
                    <input
                        placeholder='Hae reitti'
                        type='text'
                    />
                </div>
                <div className={inputContainer}>
                    <span className={inputTitle}>TARKASTELUPÄIVÄ</span>
                    <input
                        placeholder='25.8.2017'
                        type='text'
                    />
                </div>
                <div className={network}>
                    <div className={networkContainer}>
                        <label className={inputTitle}>VERKKO</label>
                        <TransitToggleButtonBar filters={[]} />
                        <div className={checkboxContainer}>
                            <input
                                type='checkbox'
                                checked={false}
                            />
                            Hae alueen linkit
                        </div>
                        <div className={checkboxContainer}>
                            <input
                                type='checkbox'
                                checked={false}
                            />
                            Hae alueen solmut
                        </div>
                    </div>
                </div>
            </span>
        );
    }
}

export default LineEditView;
