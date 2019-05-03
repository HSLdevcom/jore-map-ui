import { inject, observer } from 'mobx-react';
import { IReactionDisposer, reaction } from 'mobx';
import React from 'react';
import { matchPath } from 'react-router';
import { SearchResultStore } from '~/stores/searchResultStore';
import LineService from '~/services/lineService';
import NodeService from '~/services/nodeService';
import { INodeBase } from '~/models/INode';
import ISearchLine from '~/models/searchModels/ISearchLine';
import { ErrorStore } from '~/stores/errorStore';
import { SearchStore } from '~/stores/searchStore';
import Navigator from '~/routing/navigator';
import subSites from '~/routing/subSites';
import LineItem from './LineItem';
import Loader from '../loader/Loader';
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
class SearchResults extends React.Component<
    ISearchResultsProps,
    ISearchResultsState
> {
    private paginatedDiv: React.RefObject<HTMLDivElement>;

    private reactionDisposer: IReactionDisposer;

    constructor(props: ISearchResultsProps) {
        super(props);
        this.state = {
            isLoading: false,
            showLimit: SHOW_LIMIT_DEFAULT
        };

        this.paginatedDiv = React.createRef();
    }

    async componentDidMount() {
        this.showMoreResults();
        this.fetchAll();
        this.reactionDisposer = reaction(
            () => [
                this.props.searchStore!.searchInput,
                this.props.searchStore!.selectedTransitTypes
            ],
            this.scrollToBeginning
        );
    }

    componentWillUnmount() {
        this.reactionDisposer();
    }

    private fetchAll = async () => {
        this.setState({ isLoading: true });
        return Promise.all([this.fetchAllLines(), this.fetchAllNodes()]).then(
            () => {
                this.setState({ isLoading: false });
                this.props.searchResultStore!.search();
            }
        );
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

    private getFilteredItems = () => {
        return this.props
            .searchResultStore!.filteredItems.slice()
            .splice(0, this.state.showLimit);
    };

    private closeSearchResults = () => {
        this.props.searchStore!.setSearchInput('');
    };

    private showMoreResults = () => {
        if (
            this.paginatedDiv.current &&
            this.paginatedDiv.current.scrollTop +
                this.paginatedDiv.current.offsetHeight >=
                this.paginatedDiv.current.scrollHeight /
                    SCROLL_PAGINATION_TRIGGER_POINT
        ) {
            this.setState({
                showLimit: this.state.showLimit + INCREASE_SHOW_LIMIT
            });
        }
    };

    private scrollToBeginning = () => {
        this.setState({
            showLimit: SHOW_LIMIT_DEFAULT
        });
        if (this.paginatedDiv && this.paginatedDiv.current) {
            this.paginatedDiv.current.scrollTo(0, 0);
        }
    };

    private isLine(item: INodeBase | ISearchLine): item is ISearchLine {
        return (
            ((item as ISearchLine).routes !== undefined ||
                (item as ISearchLine).transitType !== undefined) &&
            ((item as INodeBase).shortIdLetter === undefined ||
                (item as INodeBase).shortIdString === undefined ||
                (item as INodeBase).type === undefined)
        );
    }

    render() {
        if (this.state.isLoading) {
            return (
                <div className={s.loaderContainer}>
                    <Loader />
                </div>
            );
        }
        const isRouteListView = matchPath(
            Navigator.getPathName(),
            subSites.routes
        );
        const filteredItems = this.getFilteredItems();
        return (
            <div className={s.searchResultsView}>
                <div
                    className={s.searchResultsWrapper}
                    onScroll={this.showMoreResults}
                    ref={this.paginatedDiv}
                >
                    {filteredItems.length === 0 ? (
                        <div className={s.noResults}>Ei hakutuloksia.</div>
                    ) : (
                        filteredItems.map((item: ISearchLine | INodeBase) => {
                            if (this.isLine(item)) {
                                return <LineItem key={item.id} line={item} />;
                            }
                            return <NodeItem key={item.id} node={item} />;
                        })
                    )}
                </div>
                {isRouteListView && (
                    <div
                        className={s.largeButton}
                        onClick={this.closeSearchResults}
                    >
                        Sulje
                    </div>
                )}
            </div>
        );
    }
}

export default SearchResults;
