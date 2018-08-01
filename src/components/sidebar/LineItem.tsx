import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { LineStore } from '../../stores/lineStore';
import lineHelper from '../../util/lineHelper';
import { ILine } from '../../models';

interface ILineItemState {
    type: string;
}

interface ILineItemProps {
    lineStore?: LineStore;
    line: ILine;
}

@inject('lineStore')
@observer
class LineItem extends React.Component<ILineItemProps, ILineItemState> {
    public selectLine = () => {
        this.props.lineStore!.addSelectedLine(this.props.line);
    }

    public render(): any {
        return (
            <span onClick={this.selectLine} className={'line-wrapper'}>
              {lineHelper.getTransitIcon(this.props.line.transitType, false)}
              <span className={'line-number-' + this.props.line.transitType}>
                  {this.props.line.lineNumber}
              </span>
              {this.props.line.lineName}
            </span>
        );
    }
}

export default LineItem;
