import { inject, observer } from 'mobx-react';
import * as React from 'react';
import classNames from 'classnames';
import { RouteStore } from '../../stores/routeStore';
import lineHelper from '../../util/lineHelper';
import { ILine, IRoute } from '../../models';
import RouteService from '../../services/routeService';
import {
    container,
    icon,
    label,
 } from './lineItem.scss';
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
    public selectLine = () => {
        RouteService.getRoute(this.props.line.lineId)
            .then((res: IRoute) => {
                this.props.routeStore!.clearOpenRoutes();
                this.props.routeStore!.addToOpenedRoutes(res);
            })
            .catch((err: any) => {
                console.log(err);
            });
    }

    public render(): any {
        return (
            <span onClick={this.selectLine} className={container}>
              <span className={icon}>
                {lineHelper.getTransitIcon(this.props.line.transitType, false)}
              </span>
              <span
                className={
                  classNames(
                    TransitTypeColorHelper.getColorClass(
                      this.props.line.transitType,
                      false,
                    ),
                    label,
                  )
                }
              >
                  {this.props.line.lineNumber}
              </span>
              {this.props.line.lineName}
            </span>
        );
    }
}

export default LineItem;
