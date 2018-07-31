import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { SidebarStore } from '../../stores/sidebarStore';
import lineHelper from '../../util/lineHelper';
import { ILine } from '../../models';

interface ILineItemState {
    type: string;
}

interface ILineItemProps {
    sidebarStore?: SidebarStore;
    line: ILine;
}

@inject('sidebarStore')
@observer
class LineItem extends React.Component<ILineItemProps, ILineItemState> {
    public selectLine = () => {
        this.props.sidebarStore!.addSelectedLine(this.props.line);
    }

    public render(): any {
        return (
            <span onClick={this.selectLine} className={'line-wrapper'}>
              {lineHelper.getTransitIcon(this.props.line.transitType, false)}
              <span className={'line-number-' + this.props.line.transitType}>
                  {lineHelper.parseLineNumber(this.props.line.lineId)}
              </span>
              {this.props.line.routeNumber}
            </span>
        );
    }
}

export default LineItem;
