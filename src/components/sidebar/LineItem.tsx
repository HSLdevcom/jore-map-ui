import { inject, observer } from 'mobx-react';
import * as React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';

import { RouteStore } from '../../stores/routeStore';
import lineHelper from '../../util/lineHelper';
import { LineStore } from '../../stores/lineStore';
import { ILine } from '../../models';
import TransitTypeColorHelper from '../../util/transitTypeColorHelper';
import * as s from './lineItem.scss';

interface ILineItemState {
    type: string;
}

interface ILineItemProps {
    lineStore?: LineStore;
    routeStore?: RouteStore;
    line: ILine;
    location: any;
}

@inject('lineStore')
@inject('routeStore')
@observer
class LineItem extends React.Component<ILineItemProps, ILineItemState> {

    constructor(props: ILineItemProps) {
        super(props);
    }

    public render(): any {
        let pathname = (this.props.location.pathname === '/')
            ? 'routes' : this.props.location.pathname;

        // TODO: use a library to parse these?
        const routeIds = this.props.location.search.replace('?routeIds=', '').split(',');
        pathname += '?routeIds=' + (Boolean(routeIds[0]) ? routeIds.toString() + ',' : '');
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
                            to={`${pathname}${route.id}`}
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
                        </Link>
                    );
                })}
            </div>
        );
    }
}

export default LineItem;
