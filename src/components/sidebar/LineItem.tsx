import * as React from 'react';
import classNames from 'classnames';
import lineHelper from '../../util/lineHelper';
import { ILine } from '../../models';
import TransitTypeColorHelper from '../../util/transitTypeColorHelper';
import Moment from 'react-moment';
import * as s from './lineItem.scss';
import { Link } from 'react-router-dom';
import * as qs from 'qs';

interface ILineItemState {
    type: string;
}

interface ILineItemProps {
    line: ILine;
    location: any;
}

class LineItem extends React.Component<ILineItemProps, ILineItemState> {
    public render(): any {
        const pathname = (this.props.location.pathname === '/')
            ? 'routes/' : this.props.location.pathname;
        const queryValues = qs.parse(this.props.location.search,
                                     { ignoreQueryPrefix: true, arrayLimit: 1 },
            );
        let routeIds: string[] = [];
        if (queryValues.routes) {
            routeIds = queryValues.routes.split(' ');
        }
        queryValues.routes = routeIds.join('+');
        const buildPath = (routeIds: string[]) => {
            return pathname +
                qs.stringify({ ...queryValues, routes: routeIds.join('+') },
                             { addQueryPrefix: true, encode: false },
                    );
        };
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
                        <Link
                            key={route.name + '-' + index}
                            className={s.listItemView}
                            to={`${buildPath([...routeIds, route.id])}`}
                        >
                            <div
                                key={route.name + '-' + index}
                                className={s.routeItem}
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
                                    {'Muokattu: '}
                                    <Moment
                                        date={route.date}
                                        format='DD.MM.YYYY HH:mm'
                                    />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        );
    }
}

export default LineItem;
