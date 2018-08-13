import { inject, observer } from 'mobx-react';
import * as React from 'react';
import classNames from 'classnames';
import { RouteStore } from '../../stores/routeStore';
import lineHelper from '../../util/lineHelper';
import { ILine } from '../../models';
import RouteService from '../../services/routeService';
import * as s from './lineItem.scss';
import TransitTypeColorHelper from '../../util/transitTypeColorHelper';

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
    public selectLine = async () => {
        try {
            const route = await RouteService.getRoute(this.props.line.lineId);
            this.props.routeStore!.clearRoutes();
            this.props.routeStore!.addToRoutes(route);
        } catch (err) {
        }
    }

    public render(): any {
        return (
            <span
                className={s.listItemView}
                onClick={this.selectLine}
            >
                <span className={s.icon}>
                    {lineHelper.getTransitIcon(this.props.line.transitType, false)}
                </span>
                <span
                    className={classNames(
                        TransitTypeColorHelper.getColorClass(this.props.line.transitType, false),
                        s.label,
                    )}
                >
                    {this.props.line.lineNumber}
                </span>
                {this.props.line.lineName}
            </span>
        );
    }
}

export default LineItem;
