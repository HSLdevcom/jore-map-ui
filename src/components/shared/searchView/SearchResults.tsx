import { reaction, IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { matchPath } from 'react-router';
import { ISearchLine } from '~/models/ILine';
import { INodeBase } from '~/models/INode';
import Navigator from '~/routing/navigator';
import subSites from '~/routing/subSites';
import LineService from '~/services/lineService';
import NodeService from '~/services/nodeService';
import { ErrorStore } from '~/stores/errorStore';
import { SearchResultStore } from '~/stores/searchResultStore';
import { SearchStore } from '~/stores/searchStore';
import Loader from '../loader/Loader';
import LineItem from './LineItem';
import NodeItem from './NodeItem';
import * as s from './searchResults.scss';

interface ISearchResultsProps {
    searchResultStore?: SearchResultStore;
    searchStore?: SearchStore;
    errorStore?: ErrorStore;
}

interface ISearchResultsState {
    isLoading: boolean;
    showLimit: number;
}

const SHOW_LIMIT_DEFAULT = 50;
const INCREASE_SHOW_LIMIT = 10;
const SCROLL_PAGINATION_TRIGGER_POINT = 1.25; // 1 = All the way down, 2 = half way down

@inject('searchResultStore', 'searchStore', 'errorStore')
@observer
class SearchResults extends React.Component<ISearchResultsProps, ISearchResultsState> {
    private paginatedDiv: React.RefObject<HTMLDivElement>;

    private reactionDisposer: IReactionDisposer;

    constructor(props: ISearchResultsProps) {
        super(props);
        this.state = {
            isLoading: true,
            showLimit: SHOW_LIMIT_DEFAULT,
        };

        this.paginatedDiv = React.createRef();
    }

    async componentDidMount() {
        this.showMoreResults();
        this.fetchAll();
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

    private fetchAll = async () => {
        this.setState({ isLoading: true });
        return Promise.all([this.fetchAllLines(), this.fetchAllNodes()]).then(() => {
            this.setState({ isLoading: false });
            this.props.searchResultStore!.search();
        });
    };

    private fetchAllLines = async () => {
        try {
            const searchLines: ISearchLine[] = await LineService.fetchAllSearchLines();
            this.props.searchResultStore!.setAllLines(searchLines);
        } catch (e) {
            this.props.errorStore!.addError('Linjojen haku ei onnistunut', e);
        }
    };

    private fetchAllNodes = async () => {
        try {
            const nodes = await NodeService.fetchAllNodes();
            this.props.searchResultStore!.setAllNodes(nodes);
        } catch (e) {
            this.props.errorStore!.addError('Solmujen haku ei onnistunut', e);
        }
    };

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
                {this.state.isLoading ? (
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
                            (filteredLines.length === 0 ? (
                                <div className={s.noResults}>Ei hakutuloksia.</div>
                            ) : (
                                filteredLines.map((item: ISearchLine) => {
                                    return <LineItem key={item.id} line={item} />;
                                })
                            ))}
                        {searchStore.isSearchingForNodes &&
                            (filteredNodes.length === 0 ? (
                                <div className={s.noResults}>Ei hakutuloksia.</div>
                            ) : (
                                filteredNodes.map((item: INodeBase) => {
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
