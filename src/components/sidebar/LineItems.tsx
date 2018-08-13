import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { LineStore } from '../../stores/lineStore';
import LineService from '../../services/lineService';
import LineItem from './LineItem';
import { ILine } from '../../models';
import TransitType from '../../enums/transitType';
import * as s from './lineItems.scss';

interface ILineItemsProps {
    lineStore?: LineStore;
    searchInput: string;
    filters: string[];
}

@inject('lineStore')
@observer
class LineItems extends React.Component<ILineItemsProps> {
    async componentDidMount() {
        this.props.lineStore!.linesLoading = true;
        await this.props.lineStore!.setAllLines(await LineService.getAllLines());
        this.props.lineStore!.linesLoading = false;
    }

    public filterLines = (lineName: string, lineNumber: string, transitType: TransitType) => {
        const searchTargetAttributes = lineName.toLowerCase() + lineNumber;

        if (this.props.filters.indexOf(transitType) !== -1) {
            return false;
        }
        return searchTargetAttributes.includes(this.props.searchInput);
    }

    public render(): any {
        const allLines = this.props.lineStore!.allLines;
        const linesLoading = this.props.lineStore!.linesLoading;
        if (linesLoading) {
            return (
                <div id={s.loader} />
            );
        }
        return (
            <div>
                {
                    allLines
                        .filter(line =>
                            this.filterLines(
                                line.lineName, line.lineNumber, line.transitType))
                        .map((line: ILine) => {
                            return (
                                <LineItem
                                    key={line.lineId}
                                    line={line}
                                />
                            );
                        })
                }
            </div>
        );
    }
}

export default LineItems;
