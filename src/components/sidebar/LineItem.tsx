import { inject, observer } from 'mobx-react';
import * as React from 'react';
import classNames from 'classnames';
import { RouteStore } from '../../stores/routeStore';
import lineHelper from '../../util/lineHelper';
import { ILine, IRoute } from '../../models';
import RouteService from '../../services/routeService';
import TransitType from '../../enums/transitType';
import {
    container,
    bus,
    subway,
    ferry,
    train,
    tram,
    icon,
    label,
 } from './lineItem.scss';

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

    private getClass = (transitType: TransitType) => {
        switch (transitType) {
        case TransitType.BUS:
            return classNames(bus, label);
        case TransitType.FERRY:
            return classNames(ferry, label);
        case TransitType.SUBWAY:
            return classNames(subway, label);
        case TransitType.TRAM:
            return classNames(tram, label);
        case TransitType.TRAIN:
            return classNames(train, label);
        default:
            return classNames(subway, label);
        }
    }

    public render(): any {
        return (
            <span onClick={this.selectLine} className={container}>
              <span className={icon}>
                {lineHelper.getTransitIcon(this.props.line.transitType, false)}
              </span>
              <span className={this.getClass(this.props.line.transitType)}>
                  {this.props.line.lineNumber}
              </span>
              {this.props.line.lineName}
            </span>
        );
    }
}

export default LineItem;
