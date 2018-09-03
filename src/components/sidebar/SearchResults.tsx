import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { LineStore } from '../../stores/lineStore';
import LineItem from './LineItem';
import { ILine, ILineRoute } from '../../models';
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

    public filterLines = (routes: ILineRoute[], lineId: string, transitType: TransitType) => {
        const searchTerm = this.props.lineStore!.searchInput.toLowerCase();
        if (this.props.lineStore!.filters &&
            this.props.lineStore!.filters.indexOf(transitType) !== -1) {
            return false;
<<<<<<< HEAD:src/components/sidebar/LineItems.tsx
        } if (routes
                .map(route => route.name.toLowerCase())
                .some(name => name.indexOf(searchTerm) > -1) ||
                searchTerm.indexOf(lineId) > -1) {
            return true;
        } return false;
=======
        }

        return searchTargetAttributes.includes(this.props.lineStore!.searchInput);
>>>>>>> master:src/components/sidebar/SearchResults.tsx
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
                            this.filterLines(line.routes, line.lineId, line.transitType))
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
