import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { RouteStore } from '../../stores/routeStore';
import { IRoutePath, IRoute } from '../../models';
import ToggleButton from '../controls/ToggleButton';
import classNames from 'classnames';
import LineHelper from '../../util/lineHelper';
import TransitTypeColorHelper from '../../util/transitTypeColorHelper';
import * as s from './routeShow.scss';

interface IRouteShowProps {
    routeStore?: RouteStore;
    route: IRoute;
}

@inject('routeStore')
@observer
class RouteShow extends React.Component<IRouteShowProps> {
    public render(): any {
        return (
            <span>
                <span className={s.routeName}>
                    {LineHelper.getTransitIcon(this.props.route.line.transitType, false)}
                    <span
                        className={classNames(
                            s.label,
                            TransitTypeColorHelper.getColorClass(
                                this.props.route.line.transitType,
                                false,
                            ),
                        )}
                    >
                        {this.props.route.line.lineNumber}
                    </span>
                    {this.props.route.routeName}
                </span>
                {this.props.route.routePaths
                    .sort((a, b) => a.lastModified.getTime() - b.lastModified.getTime())
                    .map((routePath: IRoutePath, index: number) => {
                        const toggleRoutePathVisibility = () => {
                            this.props.routeStore!.toggleRoutePathVisibility(
                                this.props.route, routePath);
                        };

                        return (
                            <div
                                className={s.toggle}
                                key={`${routePath.routePathName}-${index}`}
                            >
                                <span className={s.toggleTitle}>
                                    Suunta {routePath.direction}
                                </span>
                                <ToggleButton
                                    onClick={toggleRoutePathVisibility}
                                    value={routePath.visible}
                                    type={this.props.route.line.transitType}
                                />
                            </div>
                        );
                    })
                }
            </span>
        );
    }
}

export default RouteShow;
