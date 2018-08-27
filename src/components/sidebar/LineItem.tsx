import { inject, observer } from 'mobx-react';
import * as React from 'react';
import classNames from 'classnames';
import lineHelper from '../../util/lineHelper';
import { ILine } from '../../models';
import * as s from './lineItem.scss';
import TransitTypeColorHelper from '../../util/transitTypeColorHelper';
import { Link } from 'react-router-dom';

interface ILineItemState {
    type: string;
}

interface ILineItemProps {
    line: ILine;
}

@inject('routeStore')
@observer
class LineItem extends React.Component<ILineItemProps, ILineItemState> {

    public render(): any {
        return (
            <Link className={s.listItemView} to={`/routes/${this.props.line.lineId}`}>
                <span
                    className={s.listItemView}
                >
                    <span className={s.icon}>
                        {lineHelper.getTransitIcon(this.props.line.transitType, false)}
                    </span>
                    <span
                        className={classNames(
                            TransitTypeColorHelper
                                .getColorClass(this.props.line.transitType, false),
                            s.label,
                        )}
                    >
                        {this.props.line.lineNumber}
                    </span>
                    {this.props.line.lineName}
                </span>
            </Link>
        );
    }
}

export default LineItem;
