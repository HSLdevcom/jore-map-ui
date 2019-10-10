import classnames from 'classnames';
import * as L from 'leaflet';
import { reaction, IReactionDisposer } from 'mobx';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import PinIcon from '~/icons/PinIcon';
import GeocodingService, { IAddressFeature } from '~/services/geocodingService';
import EventManager from '~/util/EventManager';
import LeafletUtils from '~/util/leafletUtils';
import * as s from './addressSearch.scss';

interface IAddressSearchProps {
    map?: any;
}

interface IAddressSearchState {
    input: string;
    searchResults: IAddressFeature[];
    searchIndex: number;
    selectedSearchResult: IAddressFeature | null;
}

const SEARCH_RESULT_MARKER_COLOR = '#f44242';

@observer
class AddressSearch extends Component<IAddressSearchProps, IAddressSearchState> {
    private map: L.Map;
    private reactionDisposer: IReactionDisposer;
    private searchResultMarker: L.Marker;

    constructor(props: IAddressSearchProps) {
        super(props);

        this.state = {
            input: '',
            searchResults: [],
            searchIndex: -1,
            selectedSearchResult: null
        };
        this.map = this.props.map.current.leafletElement;
    }
    componentDidMount() {
        this.reactionDisposer = reaction(
            () => this.state.selectedSearchResult,
            this.onChangeSelectedSearchResult
        );

        EventManager.on('enter', this.setSelectedSearchResult());
        EventManager.on('arrowUp', this.moveSearchIndex('arrowUp'));
        EventManager.on('arrowDown', this.moveSearchIndex('arrowDown'));
    }
    componentWillUnmount() {
        this.reactionDisposer();

        EventManager.off('enter', this.setSelectedSearchResult());
        EventManager.off('arrowUp', this.moveSearchIndex('arrowUp'));
        EventManager.off('arrowDown', this.moveSearchIndex('arrowDown'));
    }

    private onChangeSelectedSearchResult = () => {
        const selectedSearchResult = this.state.selectedSearchResult;
        if (!selectedSearchResult) {
            this.unselectSearchResult();
            return;
        }
        if (this.searchResultMarker) {
            this.map.removeLayer(this.searchResultMarker);
        }

        const coordinates = selectedSearchResult.geometry.coordinates;
        const latLng = L.latLng(coordinates[1], coordinates[0]);
        this.setState({
            input: selectedSearchResult.properties.label,
            searchResults: [],
            searchIndex: -1
        });
        this.map.setView(latLng, this.map.getZoom());
        const marker = LeafletUtils.createDivIcon(<PinIcon color={SEARCH_RESULT_MARKER_COLOR} />);
        this.searchResultMarker = L.marker(latLng, { icon: marker }).addTo(this.map);
    };

    private unselectSearchResult = () => {
        if (this.searchResultMarker) {
            this.map.removeLayer(this.searchResultMarker);
        }

        this.setState({
            input: '',
            searchResults: [],
            searchIndex: -1,
            selectedSearchResult: null
        });
    };

    private moveSearchIndex = (direction: string) => () => {
        let searchIndex = this.state.searchIndex;
        direction === 'arrowUp' ? (searchIndex -= 1) : (searchIndex += 1);

        if (searchIndex < 0 || searchIndex > this.state.searchResults.length - 1) {
            return;
        }
        this.setState({
            searchIndex
        });
    };

    private onSearchInputChange = (event: React.FormEvent<HTMLInputElement>) => {
        const newValue = event.currentTarget.value;
        if (newValue) {
            this.setState({
                input: newValue
            });
            this.requestAddress(newValue);
        } else {
            this.unselectSearchResult();
        }
    };
    private requestAddress = async (value: string) => {
        const searchResultFeatures = await GeocodingService.fetchAddressFeaturesFromString(
            value,
            this.map.getCenter()
        );
        if (searchResultFeatures) {
            this.setState({
                searchResults: searchResultFeatures
            });
        }
    };

    private renderSearchResults = () => {
        const searchResults = this.state.searchResults;
        if (searchResults.length === 0) return null;

        return (
            <div className={s.searchResults}>
                {searchResults.map((searchResult: IAddressFeature, index) => {
                    return this.renderSearchResult(searchResult, index);
                })}
            </div>
        );
    };

    private renderSearchResult = (searchResult: IAddressFeature, searchIndex: number) => {
        const isHighlighted = this.state.searchIndex === searchIndex;
        return (
            <div
                key={searchIndex}
                className={classnames(
                    s.searchResult,
                    isHighlighted ? s.searchResultHighlight : null
                )}
                onClick={this.setSelectedSearchResult(searchIndex)}
            >
                {searchResult.properties.label}
            </div>
        );
    };

    private setSelectedSearchResult = (_searchIndex?: number) => () => {
        const searchIndex = _searchIndex !== undefined ? _searchIndex : this.state.searchIndex;
        if (searchIndex === -1) return;

        const selectedSearchResult = this.state.searchResults[searchIndex];
        this.setState({
            selectedSearchResult
        });
    };

    render() {
        return (
            <div className={s.addressSeachView}>
                <input
                    className={s.searchInput}
                    placeholder='Hae osoitetta'
                    type='text'
                    value={this.state.input}
                    onChange={this.onSearchInputChange}
                />
                {this.renderSearchResults()}
            </div>
        );
    }
}

export default AddressSearch;
