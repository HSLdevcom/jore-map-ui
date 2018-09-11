import { inject, observer } from 'mobx-react';
import { reaction } from 'mobx';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { LineStore } from '../../stores/lineStore';
import LineItem from './LineItem';
import { ILine, ILineRoute } from '../../models';
import TransitType from '../../enums/transitType';
import * as s from './searchResults.scss';
import LineService from '../../services/lineService';
import { SearchStore } from '../../stores/searchStore';
import Loader from './Loader';

interface ISearchResultsProps extends RouteComponentProps<any>{
    lineStore?: LineStore;
    searchStore?: SearchStore;
    location: any;
}

interface ISearchResultsState {
    isLoading: boolean;
    showLimit: number;
}

@inject('lineStore', 'searchStore')
@observer
class SearchResults extends React.Component<ISearchResultsProps, ISearchResultsState> {
    private paginatedDiv: React.RefObject<HTMLDivElement>;

    constructor(props: ISearchResultsProps) {
        super(props);
        this.state = {
            isLoading: false,
            showLimit: 20,
        };

        this.addSearchResults = this.addSearchResults.bind(this);
        this.closeSearchResults = this.closeSearchResults.bind(this);
        this.paginatedDiv = React.createRef();
    }

    async componentDidMount() {
        this.showMore();
        await this.queryAllLines();
        reaction(() =>
            this.props.searchStore!.searchInput,
                 this.resetShow,
            );
        reaction(() =>
            this.props.searchStore!.filters,
                 this.resetShow,
        );
    }

    async queryAllLines() {
        this.setState({ isLoading: true });
        try {
            this.props.lineStore!.setAllLines(await LineService.getAllLines());
        } catch (err) {
            // TODO: show error on screen that the query failed
        }
        this.setState({ isLoading: false });
    }

    public filterLines = (routes: ILineRoute[], lineId: string, transitType: TransitType) => {
        const searchTerm = this.props.searchStore!.searchInput.toLowerCase();

        // Filter by transitType
        if (this.props.searchStore!.filters &&
            this.props.searchStore!.filters.indexOf(transitType) !== -1) {
            return false;
        }

        // Filter by line.lineId
        if (lineId.indexOf(searchTerm) > -1) return true;

        // Filter by route.name
        return routes
            .map(route => route.name.toLowerCase())
            .some(name => name.indexOf(searchTerm) > -1);
    }

    private filteredLines = () => {
        return this.props.lineStore!.allLines
            .filter(line =>
                this.filterLines(line.routes, line.lineId, line.transitType))
            .splice(0, this.state.showLimit);
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
        this.props.searchStore!.setSearchInput('');
        this.props.searchStore!.removeAllSubLineItems();
    }

    private closeSearchResults() {
        this.props.searchStore!.setSearchInput('');
    }

    private showMore = () => {
        if (this.paginatedDiv.current &&
            this.paginatedDiv.current.scrollTop + this.paginatedDiv.current.offsetHeight
            >= this.paginatedDiv.current.scrollHeight / 1.25) {
            this.setState({ showLimit: this.state.showLimit + 10 });
        }
    }

    private resetShow = () => {
        this.setState({
            showLimit: 20,
        });
        this.paginatedDiv.current!.scrollTo(0, 0);
    }

    public render(): any {
        if (this.state.isLoading) {
            return (
                <div className={s.searchResultsView}>
                    <Loader/>
                </div>
            );
        }
        return (
            <div className={s.searchResultsView}>
                <div
                    className={s.searchResultsWrapper}
                    onScroll={this.showMore}
                    ref={this.paginatedDiv}
                >
                {
                    this.filteredLines()
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
