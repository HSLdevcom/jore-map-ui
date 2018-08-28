import * as React from 'react';
import { inject, observer } from 'mobx-react';
import classNames from 'classnames';
import lineHelper from '../../util/lineHelper';
import { ILine } from '../../models';
import { LineStore } from '../../stores/lineStore';
import TransitTypeColorHelper from '../../util/transitTypeColorHelper';
import Moment from 'react-moment';
import * as s from './lineItem.scss';
import { Link } from 'react-router-dom';

interface ILineItemState {
    type: string;
}

interface ILineItemProps {
    line: ILine;
    location: any;
    lineStore?: LineStore;
}

@inject('lineStore')
@observer
class LineItem extends React.Component<ILineItemProps, ILineItemState> {

    constructor(props: ILineItemProps) {
        super(props);
    }

    public render(): any {
        let pathname = (this.props.location.pathname === '/')
            ? 'routes' : this.props.location.pathname;

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
