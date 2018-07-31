import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { SidebarStore } from '../../stores/sidebarStore';
import lineHelper from '../../util/lineHelper';
import LineService from '../../services/lineService';
import LineItem from './LineItem';
import { ILine } from '../../models';

interface ILineItemsProps {
    sidebarStore?: SidebarStore;
    searchInput: string;
    filters: string[];
}

@inject('sidebarStore')
@observer
class LineItems extends React.Component<ILineItemsProps> {
    componentDidMount() {
        LineService.getAllLines()
            .then((lines: ILine[]) => {
                this.props.sidebarStore!.setAllLines(lines);
            })
            .catch((err: any) => {
                console.log(err);
            });
    }

    public checkFilters = (description: string, lineNumber: string, transitTypeCode: string) => {
        const transitType = lineHelper.convertTransitTypeCodeToTransitType(transitTypeCode);
        const searchTargetAttributes = description.toLowerCase() + lineNumber;

        if (this.props.filters.indexOf(transitType) !== -1) {
            return false;
        }
        if (searchTargetAttributes.includes(this.props.searchInput)) {
            return true;
        }
        return false;
    }

    public render(): any {
        const allLines = this.props.sidebarStore!.allLines;

        if (!allLines.length) {
            return 'Fetching';
        }
        return (
            <div>
                {
                    allLines
                        .filter(line =>
                            this.checkFilters(
                                line.routeNumber, line.lineNumber, line.lineLayer))
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
