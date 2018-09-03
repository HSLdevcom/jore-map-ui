import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { LineStore } from '../../stores/lineStore';
import LineItem from './LineItem';
import { ILine } from '../../models';
import TransitType from '../../enums/transitType';
import * as s from './searchResults.scss';
import LineService from '../../services/lineService';
import Loader from './Loader';
import { RouteComponentProps } from 'react-router';

interface ISearchResultsProps extends RouteComponentProps<any>{
    lineStore?: LineStore;
    location: any;
}

interface ISearchResultsState {
    isLoading: boolean;
}

@inject('lineStore')
@observer
class SearchResults extends React.Component<ISearchResultsProps, ISearchResultsState> {

    constructor(props: ISearchResultsProps) {
        super(props);
        this.state = {
            isLoading: false,
        };
    }

    componentDidMount() {
        this.queryAllLines();
    }

    async queryAllLines() {
        this.setState({ isLoading: true });
        try {
            await this.props.lineStore!.setAllLines(await LineService.getAllLines());
        } catch (err) {
            // TODO: show error on screen that the query failed
        }
        this.setState({ isLoading: false });
    }

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
        if (this.state.isLoading) {
            return (
                <div className={s.searchResultsView}>
                    <Loader/>
                </div>
            );
        }
        return (
            <div className={s.searchResultsView}>
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
                                    history={this.props.history}
                                />
                            );
                        })
                }
            </div>
        );
    }
}

export default SearchResults;
