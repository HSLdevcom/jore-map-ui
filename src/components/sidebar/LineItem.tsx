import { inject, observer } from 'mobx-react';
import * as React from 'react';
import classNames from 'classnames';
import { RouteStore } from '../../stores/routeStore';
import lineHelper from '../../util/lineHelper';
import { ILine, IRoute } from '../../models';
import RouteService from '../../services/routeService';
import TransitTypeColorHelper from '../../util/transitTypeColorHelper';
import Moment from 'react-moment';
import * as s from './lineItem.scss';

interface ILineItemState {
    type: string;
}

interface ILineItemProps {
    routeStore?: RouteStore;
    line: ILine;
}

@inject('routeStore')
@observer
class LineItem extends React.Component<ILineItemProps, ILineItemState> {
    private selectRoute(routeId: string) {
        RouteService.getRoute(this.props.line.lineId, routeId)
            .then((res: IRoute) => {
                this.props.routeStore!.clearRoutes();
                this.props.routeStore!.addToRoutes(res);
            })
            .catch((err: any) => {
            });
    }

    public render(): any {
        return (
            <div className={s.listItemView}>
                <div className={s.lineItem}>
                    <div className={s.icon}>
                        {lineHelper.getTransitIcon(this.props.line.transitType, false)}
                    </div>
                    <div
                        className={classNames(
                            TransitTypeColorHelper.getColorClass(this.props.line.transitType),
                            s.label,
                        )}
                    >
                        {this.props.line.lineNumber}
                    </div>
                </div>
                {this.props.line.routes.map((route, index) => {
                    return (
                        <div
                            key={route.name + '-' + index}
                            className={s.routeItem}
                            onClick={this.selectRoute.bind(this, route.id)}
                        >
                            <div
                                className={classNames(
                                    s.routeName,
                                    TransitTypeColorHelper.getColorClass(
                                        this.props.line.transitType),
                                )}
                            >
                                {route.name}
                            </div>
                            <div className={s.routeDate}>
                                <Moment
                                    date={route.date}
                                    format='DD.MM.YYYY HH:mm'
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }
}

export default LineItem;
