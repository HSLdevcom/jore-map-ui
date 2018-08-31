import * as React from 'react';
import classNames from 'classnames';
import lineHelper from '../../util/lineHelper';
import { ILine } from '../../models';
import TransitTypeColorHelper from '../../util/transitTypeColorHelper';
import Moment from 'react-moment';
import * as s from './lineItem.scss';
import lineStore from '../../stores/lineStore';
import { Location, History } from 'history';
import LinkBuilder from '../../factories/linkBuilder';

interface ILineItemState {
    type: string;
}

interface ILineItemProps {
    line: ILine;
    location: Location;
    history: History;
}

class LineItem extends React.Component<ILineItemProps, ILineItemState> {
    public render(): any {
        const gotoUrl = (url:string) => () => {
            this.props.history.push(url);
            lineStore.setSearchInput('');
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
                            <div
                                key={route.name + '-' + index}
                                className={s.routeItem}
                                onClick={
                                    gotoUrl(LinkBuilder.createLink(this.props.location, route.id))}
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
                    );
                })}
            </div>
        );
    }
}

export default LineItem;
