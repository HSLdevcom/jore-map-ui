import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { RouteStore } from '../../stores/routeStore';
import TransitToggleButtonBar from '../controls/TransitToggleButtonBar';
import { IRoutePath, IRoute } from '../../models';
import ToggleButton from '../controls/ToggleButton';
import classNames from 'classnames';
import LineHelper from '../../util/lineHelper';
import TransitTypeColorHelper from '../../util/transitTypeColorHelper';
import * as s from './lineEditView.scss';

interface ILineEditViewProps {
    routeStore?: RouteStore;
}

@inject('routeStore')
@observer
class LineEditView extends React.Component<ILineEditViewProps> {
    private directionList(route: IRoute) {
        return route.routePaths
            .sort((a, b) => a.lastModified.getTime() - b.lastModified.getTime())
            .map((routePath: IRoutePath, index: number) => {
                const toggleRoutePathVisibility = () => {
                    this.props.routeStore!.toggleRoutePathVisibility(route, routePath);
                };

                return (
                    <div
                        className={s.toggle}
                        key={`${routePath.directionName}-${index}`}
                    >
                        <span className={s.toggleTitle}>
                            Suunta {routePath.direction}
                        </span>
                        <ToggleButton
                            onClick={toggleRoutePathVisibility}
                            value={routePath.visible}
                            type={route.line.transitType}
                        />
                    </div>
                );
            });
    }

    private routeList(routes: IRoute[]) {
        return routes.map((route: IRoute) => {
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
                    {
                        this.directionList(route)
                    }
                </div>
            );
        });
    }

    public render(): any {
        return (
            <span className={s.lineEditView}>
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

export default LineEditView;
