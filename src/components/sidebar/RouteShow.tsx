import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { FaTimes } from 'react-icons/fa';
import { History, Location } from 'history';
import classNames from 'classnames';
import { RouteStore } from '../../stores/routeStore';
import { IRoutePath, IRoute } from '../../models';
import ToggleButton from '../controls/ToggleButton';
import LineHelper from '../../util/lineHelper';
import TransitTypeColorHelper from '../../util/transitTypeColorHelper';
import ColorScale from '../../util/colorScale';
import LinkBuilder from '../../factories/linkBuilder';
import * as s from './routeShow.scss';

interface IRouteShowProps {
    routeStore?: RouteStore;
    route: IRoute;
    visibleRoutePathsIndex: number;
    history: History;
    location: Location<any>;
}

@inject('routeStore')
@observer
class RouteShow extends React.Component<IRouteShowProps> {

    private onClose = () => {
        this.props.routeStore!.removeFromRoutes(this.props.route.routeId);
        this.props.history.push(LinkBuilder
            .createLinkWithoutRoute(this.props.location, this.props.route.routeId));
    }

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
            <div onClick={this.onClose} className={s.closeView}>
                <FaTimes className={s.close}/>
            </div >
        </div>
        );
    }

    private renderRoutePaths() {
        let visibleRoutePathsIndex = this.props.visibleRoutePathsIndex;

        return this.props.route.routePaths
        .slice().sort((a, b) => a.lastModified.getTime() - b.lastModified.getTime())
        .map((routePath: IRoutePath, index: number) => {
            const toggleRoutePathVisibility = () => {
                this.props.routeStore!.toggleRoutePathVisibility(routePath.internalId);
            };
            const routeColor = ColorScale.getColors(
                this.props.routeStore!.visibleRoutePathAmount)[visibleRoutePathsIndex];
            if (routePath.visible) {
                visibleRoutePathsIndex += 1;
            }
            return (
                <div
                    className={s.toggle}
                    key={routePath.internalId}
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
