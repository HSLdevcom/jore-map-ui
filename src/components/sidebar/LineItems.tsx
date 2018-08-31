import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { LineStore } from '../../stores/lineStore';
import LineItem from './LineItem';
import { ILine } from '../../models';
import TransitType from '../../enums/transitType';
import * as s from './lineItems.scss';

interface ILineItemsProps {
    lineStore?: LineStore;
    location: any;
}

@inject('lineStore')
@observer
class LineItems extends React.Component<ILineItemsProps> {

    public filterLines = (lineNumber: string, transitType: TransitType) => {
        const searchTargetAttributes = lineNumber;
        if (this.props.lineStore!.filters &&
            this.props.lineStore!.filters.indexOf(transitType) !== -1) {
            return false;
        }

        return searchTargetAttributes.includes(this.props.lineStore!.searchInput);
    }

    public render(): any {
        const allLines = this.props.lineStore!.allLines;
        return (
            <div className={s.lineItemsView}>
                {
                    allLines
                        .filter(line =>
                            this.filterLines(line.lineNumber, line.transitType))
                        // Showing only the first 100 results to improve rendering performance
                        .splice(0, 100)
                        .map((line: ILine) => {
                            return (
                                <LineItem
                                    key={line.lineId}
                                    line={line}
                                    location={this.props.location}
                                />
                            );
                        })
                }
            </div>
        );
    }
}

export default LineItems;
