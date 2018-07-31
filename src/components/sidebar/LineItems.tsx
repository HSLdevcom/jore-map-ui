import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { LineStore } from '../../stores/lineStore';
import LineService from '../../services/lineService';
import LineItem from './LineItem';
import { ILine } from '../../models';
import TransitType from '../../enums/transitType';

interface ILineItemsProps {
    lineStore?: LineStore;
    searchInput: string;
    filters: string[];
}

@inject('lineStore')
@observer
class LineItems extends React.Component<ILineItemsProps> {
    componentDidMount() {
        LineService.getAllLines()
            .then((lines: ILine[]) => {
                this.props.lineStore!.setAllLines(lines);
            })
            .catch((err: any) => {
                console.log(err);
            });
    }

    public filterLines = (routeName: string, lineNumber: string, transitType: TransitType) => {
        const searchTargetAttributes = routeName.toLowerCase() + lineNumber;

        if (this.props.filters.indexOf(transitType) !== -1) {
            return false;
        }
        if (searchTargetAttributes.includes(this.props.searchInput)) {
            return true;
        }
        return false;
    }

    public render(): any {
        const allLines = this.props.lineStore!.allLines;

        if (!allLines.length) {
            return 'Fetching';
        }
        return (
            <div>
                {
                    allLines
                        .filter(line =>
                            this.filterLines(
                                line.routeName, line.lineNumber, line.transitType))
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
