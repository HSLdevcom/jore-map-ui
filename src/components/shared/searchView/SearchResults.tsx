import { inject, observer } from 'mobx-react';
import { IReactionDisposer, reaction } from 'mobx';
import React from 'react';
import { LineStore } from '~/stores/lineStore';
import { ILine, ILineRoute } from '~/models';
import TransitType from '~/enums/transitType';
import LineService from '~/services/lineService';
import { SearchStore } from '~/stores/searchStore';
import Navigator from '~/routing/navigator';
import subSites from '~/routing/subSites';
import LineItem from './LineItem';
import Loader from '../loader/Loader';
import * as s from './searchResults.scss';

interface ISearchResultsProps{
    lineStore?: LineStore;
    searchStore?: SearchStore;
}

interface ISearchResultsState {
    isLoading: boolean;
    showLimit: number;
}

const SHOW_LIMIT_DEFAULT = 20;
const INCREASE_SHOW_LIMIT = 10;
const SCROLL_PAGINATION_TRIGGER_POINT = 1.25; // 1 = All the way down, 2 = half way down

@inject('lineStore', 'searchStore')
@observer
class SearchResults extends React.Component<ISearchResultsProps, ISearchResultsState> {
    private paginatedDiv: React.RefObject<HTMLDivElement>;

    private reactionDisposer: IReactionDisposer;

    constructor(props: ISearchResultsProps) {
        super(props);
        this.state = {
            isLoading: false,
            showLimit: SHOW_LIMIT_DEFAULT,
        };

        this.paginatedDiv = React.createRef();
    }

    async componentDidMount() {
        this.showMore();
        await this.queryAllLines();
        this.reactionDisposer = reaction(() =>
        [this.props.searchStore!.searchInput, this.props.searchStore!.selectedTransitTypes],
                                         this.resetShow,
            );
    }

    componentWillUnmount() {
        this.reactionDisposer();
    }

    private queryAllLines = async () => {
        this.setState({ isLoading: true });
        const lines = await LineService.fetchAllLines();
        if (lines !== null) {
            this.props.lineStore!.setAllLines(lines);
        }
        this.setState({ isLoading: false });
    }

    private filterLines = (routes: ILineRoute[], lineId: string, transitType: TransitType) => {
        const searchTerm = this.props.searchStore!.searchInput.toLowerCase();

        // Filter by transitType
        if (!this.props.searchStore!.selectedTransitTypes.includes(transitType)) {
            return false;
        }

        // Filter by line.id
        if (lineId.indexOf(searchTerm) > -1) return true;

        // Filter by route.name
        return routes
            .map(route => route.name.toLowerCase())
            .some(name => name.indexOf(searchTerm) > -1);
    }

    private filteredLines = () => {
        return this.props.lineStore!.allLines
            .filter(line =>
                this.filterLines(line.routes, line.id, line.transitType))
            .splice(0, this.state.showLimit);
    }

    private renderSearchResultButton() {
        const subLineItemsLength = this.props.searchStore!.subLineItems.length;

        const isSearchResultButtonVisible = subLineItemsLength > 0 ||
        (Navigator.getPathName() !== subSites.home && subLineItemsLength === 0);
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

    private addSearchResults = () => {
        // TODO, add all selected routePaths into location (use LinkBuilder)
        this.props.searchStore!.setSearchInput('');
        this.props.searchStore!.removeAllSubLineItems();
    }

    private closeSearchResults = () => {
        this.props.searchStore!.setSearchInput('');
    }
    private showMore = () => {
        if (this.paginatedDiv.current &&
            this.paginatedDiv.current.scrollTop + this.paginatedDiv.current.offsetHeight
            >= this.paginatedDiv.current.scrollHeight / SCROLL_PAGINATION_TRIGGER_POINT) {
            this.setState({ showLimit: this.state.showLimit + INCREASE_SHOW_LIMIT });
        }
    }

    private resetShow = () => {
        this.setState({
            showLimit: SHOW_LIMIT_DEFAULT,
        });
        this.paginatedDiv.current!.scrollTo(0, 0);
    }

    render() {
        if (this.state.isLoading) {
            return (
                <div className={s.searchResultsView}>
                    <Loader/>
                </div>
            );
        }
        const filteredLines = this.filteredLines();
        return (
            <div className={s.searchResultsView}>
                <div
                    className={s.searchResultsWrapper}
                    onScroll={this.showMore}
                    ref={this.paginatedDiv}
                >
                {
                    filteredLines.length === 0 ?
                        <div className={s.noResults}>
                            Ei hakutuloksia.
                        </div>
                        :
                        filteredLines
                            .map((line: ILine) => {
                                return (
                                    <LineItem
                                        key={line.id}
                                        line={line}
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
