import { reaction, IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { matchPath } from 'react-router';
import { ISearchLine } from '~/models/ILine';
import { ISearchNode } from '~/models/INode';
import Navigator from '~/routing/navigator';
import subSites from '~/routing/subSites';
import searchResultStore, { SearchResultStore } from '~/stores/searchResultStore';
import { SearchStore } from '~/stores/searchStore';
import Loader from '../loader/Loader';
import LineItem from './LineItem';
import NodeItem from './NodeItem';
import * as s from './searchResults.scss';

interface ISearchResultsProps {
    searchResultStore?: SearchResultStore;
    searchStore?: SearchStore;
}

interface ISearchResultsState {
    showLimit: number;
}

const SHOW_LIMIT_DEFAULT = 50;
const INCREASE_SHOW_LIMIT = 10;
const SCROLL_PAGINATION_TRIGGER_POINT = 1.25; // 1 = All the way down, 2 = half way down

@inject('searchResultStore', 'searchStore')
@observer
class SearchResults extends React.Component<ISearchResultsProps, ISearchResultsState> {
    private paginatedDiv: React.RefObject<HTMLDivElement>;

    private reactionDisposer: IReactionDisposer;

    constructor(props: ISearchResultsProps) {
        super(props);
        this.state = {
            showLimit: SHOW_LIMIT_DEFAULT,
        };

        this.paginatedDiv = React.createRef();
    }

    async componentDidMount() {
        this.showMoreResults();
        this.reactionDisposer = reaction(
            () => [
                this.props.searchStore!.searchInput,
                this.props.searchStore!.selectedTransitTypes,
            ],
            this.scrollToBeginning
        );
    }

    componentWillUnmount() {
        this.reactionDisposer();
    }

    private getFilteredLines = () => {
        return this.props.searchResultStore!.filteredLines.slice().splice(0, this.state.showLimit);
    };

    private getFilteredNodes = () => {
        return this.props.searchResultStore!.filteredNodes.slice().splice(0, this.state.showLimit);
    };

    private closeSearchResults = () => {
        this.props.searchStore!.setSearchInput('');
    };

    private showMoreResults = () => {
        if (
            this.paginatedDiv.current &&
            this.paginatedDiv.current.scrollTop + this.paginatedDiv.current.offsetHeight >=
                this.paginatedDiv.current.scrollHeight / SCROLL_PAGINATION_TRIGGER_POINT
        ) {
            this.setState({
                showLimit: this.state.showLimit + INCREASE_SHOW_LIMIT,
            });
        }
    };

    private scrollToBeginning = () => {
        this.setState({
            showLimit: SHOW_LIMIT_DEFAULT,
        });
        if (this.paginatedDiv && this.paginatedDiv.current) {
            this.paginatedDiv.current.scrollTo(0, 0);
        }
    };

    render() {
        const searchStore = this.props.searchStore!;
        const isRouteListView = matchPath(Navigator.getPathName(), subSites.routes);
        const filteredLines = this.getFilteredLines();
        const filteredNodes = this.getFilteredNodes();
        return (
            <div className={s.searchResultsView}>
                {searchStore!.isLoading || searchResultStore!.allLines.length === 0 ? (
                    <div className={s.searchResultsView}>
                        <Loader />
                    </div>
                ) : (
                    <div
                        className={s.searchResultsWrapper}
                        onScroll={this.showMoreResults}
                        ref={this.paginatedDiv}
                    >
                        {searchStore.isSearchingForLines &&
                            (filteredLines.length === 0 && !searchResultStore.isSearching ? (
                                <div className={s.noResults}>Ei hakutuloksia.</div>
                            ) : (
                                filteredLines.map((item: ISearchLine) => {
                                    return <LineItem key={item.id} line={item} />;
                                })
                            ))}
                        {searchStore.isSearchingForNodes &&
                            (filteredNodes.length === 0 && !searchResultStore.isSearching ? (
                                <div className={s.noResults}>Ei hakutuloksia.</div>
                            ) : (
                                filteredNodes.map((item: ISearchNode) => {
                                    return <NodeItem key={item.id} node={item} />;
                                })
                            ))}
                    </div>
                )}
                {isRouteListView && (
                    <div className={s.largeButton} onClick={this.closeSearchResults}>
                        Sulje
                    </div>
                )}
            </div>
        );
    }
}

export default SearchResults;
