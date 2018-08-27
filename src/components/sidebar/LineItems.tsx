import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { LineStore } from '../../stores/lineStore';
import LineService from '../../services/lineService';
import LineItem from './LineItem';
import { ILine, ILineRoute } from '../../models';
import TransitType from '../../enums/transitType';
import * as s from './lineItems.scss';

interface ILineItemsProps {
    lineStore?: LineStore;
    searchInput: string;
}

@inject('lineStore')
@observer
class LineItems extends React.Component<ILineItemsProps> {
    componentDidMount() {
        if (this.props.lineStore!.allLines.length === 0) {
            LineService.getAllLines()
                .then((lines: ILine[]) => {
                    this.props.lineStore!.setAllLines(lines);
                })
                .catch((err: any) => {
                    // tslint:disable-next-line:no-console
                    console.log(err);
                });
        }
    }

    public filterLines = (routes: ILineRoute[], lineId: string, transitType: TransitType) => {
        let routeNames = '';
        routes.forEach((lineRoute: ILineRoute) => {
            routeNames += lineRoute.name;
        });

        const searchTargetAttributes = lineId + routeNames.toLowerCase();
        if (this.props.lineStore!.filters &&
            this.props.lineStore!.filters.indexOf(transitType) !== -1) {
            return false;
        }

        if (searchTargetAttributes.includes(this.props.lineStore!.searchInput.toLowerCase())) {
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
            <div className={s.lineItemsView}>
                {
                    allLines
                        .filter(line =>
                            this.filterLines(line.routes, line.lineId, line.transitType))
                        // Showing only the first 100 results to improve rendering performance
                        .splice(0, 100)
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
