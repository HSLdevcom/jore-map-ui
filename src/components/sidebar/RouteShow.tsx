import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { RouteStore } from '../../stores/routeStore';
import { IRoutePath, IRoute } from '../../models';
import ToggleButton from '../controls/ToggleButton';
import classNames from 'classnames';
import LineHelper from '../../util/lineHelper';
import TransitTypeColorHelper from '../../util/transitTypeColorHelper';
import colorScale from '../../util/colorScale';
import * as s from './routeShow.scss';

interface IRouteShowProps {
    routeStore?: RouteStore;
    route: IRoute;
}

@inject('routeStore')
@observer
class RouteShow extends React.Component<IRouteShowProps> {

    private renderRouteName() {
        return (
        <div className={s.routeName}>
            {LineHelper.getTransitIcon(this.props.route.line.transitType, false)}
            <div
                className={classNames(
                    s.label,
                    TransitTypeColorHelper.getColorClass(this.props.route.line.transitType),
                )}
            >
                {this.props.route.line.lineNumber}
            </div>
            {this.props.route.routeName}
        </div>
        );
    }

    private renderRoutePaths() {
        let visibleRoutePathsIndex = 0;

        return this.props.route.routePaths
        .sort((a, b) => a.lastModified.getTime() - b.lastModified.getTime())
        .map((routePath: IRoutePath, index: number) => {
            const toggleRoutePathVisibility = () => {
                this.props.routeStore!.toggleRoutePathVisibility(
                    this.props.route, routePath);
            };
            const visibleRoutePaths = this.props.route.routePaths.filter(
                x => x.visible).length;
            const routeColor = colorScale.getColors(
                visibleRoutePaths)[visibleRoutePathsIndex];
            if (routePath.visible) {
                visibleRoutePathsIndex += 1;
            }

            return (
                <div
                    className={s.toggle}
                    key={`${routePath.routePathName}-${index}`}
                >
                    <div className={s.toggleTitle}>
                        Suunta {routePath.direction}
                    </div>
                    <ToggleButton
                        onClick={toggleRoutePathVisibility}
                        value={routePath.visible}
                        type={this.props.route.line.transitType}
                        color={routePath.visible ? routeColor : '#898989'}
                    />
                </div>
            );
        });
    }

    public render(): any {
        return (
            <div className={s.routeShowView}>
                {this.renderRouteName()}
                {this.renderRoutePaths()}
            </div>
        );
    }
}

export default RouteShow;
