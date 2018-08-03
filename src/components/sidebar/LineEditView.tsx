import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { RouteStore } from '../../stores/routeStore';
import TransitToggleButtonBar from '../controls/TransitToggleButtonBar';
import { IDirection, IRoute } from '../../models';
import ToggleButton from '../controls/ToggleButton';
import classNames from 'classnames';
import LineHelper from '../../util/lineHelper';
import TransitTypeColorHelper from '../../util/transitTypeColorHelper';
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
    label,
} from './lineEditView.scss';

interface ILineEditViewProps {
    routeStore?: RouteStore;
}

@inject('routeStore')
@observer
class LineEditView extends React.Component<ILineEditViewProps> {
    private directionList(route: IRoute) {
        return route.directions
            .sort((a, b) => a.lastModified.getTime() - b.lastModified.getTime())
            .map((direction: IDirection, index: number) => {
                const onClick = () => {
                    this.props.routeStore!.toggleDirectionIsVisible(route, direction);
                };

                return (
                    <div
                        className={toggle}
                        key={`${direction.directionName}-${index}`}
                    >
                        <span className={toggleTitle}>
                            Suunta {direction.direction}
                        </span>
                        <ToggleButton
                            onClick={onClick}
                            value={direction.visible}
                            type={route.line.transitType}
                        />
                    </div>
                );
            });
    }

    private routeList(routes: IRoute[]) {
        return routes.map((route: IRoute) => {
            return (
                <div className={line} key={route.lineId}>
                    <span>
                        {LineHelper.getTransitIcon(route.line.transitType, false)}
                        <span
                            className={
                                classNames(
                                    label,
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
                    {
                        this.directionList(route)
                    }
                    <div className={checkboxContainer}>
                        <input
                            type='checkbox'
                            checked={false}
                        />
                        Kopioi reitti toiseen suuntaan
                    </div>
                </div>
            );
        });
    }

    public render(): any {
        return (
            <span className={container}>
                {
                    this.routeList(this.props.routeStore!.routes)
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
