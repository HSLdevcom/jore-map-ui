import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { LineStore } from '../../stores/lineStore';
import LineItem from './LineItem';
import { ILine, ILineRoute } from '../../models';
import TransitType from '../../enums/transitType';
import * as s from './searchResults.scss';
import LineService from '../../services/lineService';
import { SearchStore } from '../../stores/searchStore';
import Loader from './Loader';
import { RouteComponentProps } from 'react-router';

interface ISearchResultsProps extends RouteComponentProps<any>{
    lineStore?: LineStore;
    searchStore?: SearchStore;
    location: any;
}

interface ISearchResultsState {
    isLoading: boolean;
}

@inject('lineStore', 'searchStore')
@observer
class SearchResults extends React.Component<ISearchResultsProps, ISearchResultsState> {

    constructor(props: ISearchResultsProps) {
        super(props);
        this.state = {
            isLoading: false,
        };

        this.addSearchResults = this.addSearchResults.bind(this);
        this.closeSearchResults = this.closeSearchResults.bind(this);
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

        // Filter by transitType
        if (this.props.lineStore!.filters &&
            this.props.lineStore!.filters.indexOf(transitType) !== -1) {
            return false;
        }

        // Filter by line.lineId
        if (lineId.indexOf(searchTerm) > -1) return true;

        // Filter by route.name
        if (routes
                .map(route => route.name.toLowerCase())
                .some(name => name.indexOf(searchTerm) > -1)) {
            return true;
        }

        return false;
    }

    private renderSearchResultButton() {
        const subLineItemsLength = this.props.searchStore!.subLineItems.length;

        const isSearchResultButtonVisible = subLineItemsLength > 0 ||
        (this.props.location.pathname !== '/' && subLineItemsLength === 0);
        if (!isSearchResultButtonVisible) {
            return;
        }

        if (subLineItemsLength > 0) {
            return (
                <div
                    className={s.searchResultButton}
                    onClick={this.addSearchResults}
                >
                    Lisää tarkasteluun ({subLineItemsLength})
                </div>
            );
        }
        return (
            <div
                className={s.searchResultButton}
                onClick={this.closeSearchResults}
            >
                Sulje
            </div>
        );
    }

    private addSearchResults() {
        // TODO, add all selected routePaths into location (use LinkBuilder)
        this.props.lineStore!.setSearchInput('');
        this.props.searchStore!.removeAllSubLineItems();
    }

    private closeSearchResults() {
        this.props.lineStore!.setSearchInput('');
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
                <div className={s.searchResultsWrapper}>
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
                {this.renderSearchResultButton()}
            </div>
        );
    }
}

export default SearchResults;
