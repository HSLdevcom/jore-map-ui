import { inject, observer } from 'mobx-react';
import { IReactionDisposer, reaction } from 'mobx';
import React from 'react';
import { SearchResultStore } from '~/stores/searchResultStore';
import { ILine } from '~/models';
import LineService from '~/services/lineService';
import NodeService from '~/services/nodeService';
import { SearchStore } from '~/stores/searchStore';
import INodeBase from '~/models/baseModels/INodeBase';
import Navigator from '~/routing/navigator';
import subSites from '~/routing/subSites';
import LineItem from './LineItem';
import Loader from '../loader/Loader';
import NodeItem from './NodeItem';
import * as s from './searchResults.scss';

interface ISearchResultsProps{
    searchResultStore?: SearchResultStore;
    searchStore?: SearchStore;
}

interface ISearchResultsState {
    isLoading: boolean;
    showLimit: number;
}

const SHOW_LIMIT_DEFAULT = 20;
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
            isLoading: false,
            showLimit: SHOW_LIMIT_DEFAULT,
        };

        this.paginatedDiv = React.createRef();
    }

    async componentDidMount() {
        this.showMore();
        this.fetchAll();
        this.reactionDisposer = reaction(
            () =>
                [
                    this.props.searchStore!.searchInput,
                    this.props.searchStore!.selectedTransitTypes,
                ],
            this.resetShow,
            );
    }

    componentWillUnmount() {
        this.reactionDisposer();
    }

    private fetchAll = async () => {
        this.setState({ isLoading: true });
        return Promise.all([
            this.queryAllLines(),
            this.queryAllNodes(),
        ]).then(() => this.setState({ isLoading: false }));
    }

    private queryAllLines = async () => {
        const lines = await LineService.fetchAllLines();
        if (lines !== null) {
            this.props.searchResultStore!.setAllLines(lines);
        }
    }

    private queryAllNodes = async () => {
        const nodes = await NodeService.fetchAllNodes();
        if (nodes !== null) {
            this.props.searchResultStore!.setAllNodes(nodes);
        }
    }

    private getFilteredItems = () => {
        return this.props.searchResultStore!.getFilteredItems(
            this.props.searchStore!.searchInput.toLowerCase(),
            this.props.searchStore!.selectedTransitTypes,
            this.props.searchStore!.isSearchingForLines,
            this.props.searchStore!.isSearchingForNodes,
        ).splice(0, this.state.showLimit);
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

    private isLine(item: INodeBase | ILine): item is ILine {
        return (
            (item as ILine).routes !== undefined ||
            (item as ILine).transitType !== undefined
        ) && (
            (item as INodeBase).shortId === undefined ||
            (item as INodeBase).type === undefined
        );
    }

    render() {
        if (this.state.isLoading) {
            return (
                <div className={s.loaderContainer}>
                    <Loader/>
                </div>
            );
        }
        const filteredItems = this.getFilteredItems();
        return (
            <div className={s.searchResultsView}>
                <div
                    className={s.searchResultsWrapper}
                    onScroll={this.showMore}
                    ref={this.paginatedDiv}
                >
                {
                    filteredItems.length === 0 ?
                        <div className={s.noResults}>
                            Ei hakutuloksia.
                        </div>
                        :
                        filteredItems
                            .map((item: ILine | INodeBase) => {
                                if (this.isLine(item)) {
                                    return (
                                        <LineItem
                                            key={item.id}
                                            line={item}
                                        />
                                    );
                                }
                                return (
                                    <NodeItem
                                        key={item.id}
                                        node={item}
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
