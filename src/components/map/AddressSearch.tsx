import React, { Component } from 'react';
import { IReactionDisposer, reaction } from 'mobx';
import * as L from 'leaflet';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import ApiClient, { RequestMethod } from '~/util/ApiClient';
import EventManager from '~/util/EventManager';
import PinIcon from '~/icons/PinIcon';
import constants from '~/constants/constants';
import { createDivIcon } from './layers/mapIcons/NodeMarker';
import * as s from './addressSearch.scss';

interface IAddressSearchProps {
    map?: any;
}

interface ISearchResultFeature {
    geometry: any;
    properties: any;
    type: string;
}

interface IAddressSearchState {
    input: string;
    searchResults: ISearchResultFeature[];
    searchIndex: number;
    selectedSearchResult: ISearchResultFeature | null;
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
            selectedSearchResult: null,
        };
        this.map = this.props.map.current.leafletElement;
    }
    componentDidMount() {
        this.reactionDisposer = reaction(
            () => this.state.selectedSearchResult,
            this.onChangeSelectedSearchResult,
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
        const coordinates = selectedSearchResult.geometry.coordinates;
        const latLng = L.latLng(coordinates[1], coordinates[0]);
        this.setState({
            input: selectedSearchResult.properties.label,
            searchResults: [],
            searchIndex: -1,
        });
        this.map.setView(latLng, this.map.getZoom());
        const marker = createDivIcon(<PinIcon color={SEARCH_RESULT_MARKER_COLOR}/>);
        this.searchResultMarker = L.marker(latLng, { icon: marker }).addTo(this.map);
    }

    private unselectSearchResult = () => {
        if (this.searchResultMarker) this.map.removeLayer(this.searchResultMarker);

        this.setState({
            input: '',
            searchResults: [],
            searchIndex: -1,
            selectedSearchResult: null,
        });
    }

    private moveSearchIndex = (direction: string) => () => {
        let searchIndex = this.state.searchIndex;
        direction === 'arrowUp' ? searchIndex -= 1 : searchIndex += 1;

        if (searchIndex < 0 || searchIndex > this.state.searchResults.length - 1) return;
        this.setState({
            searchIndex,
        });
    }

    private onSearchInputChange = (event: React.FormEvent<HTMLInputElement>) => {
        const newValue = event.currentTarget.value;
        if (newValue) {
            this.setState({
                input: newValue,
            });
            this.requestAddress(newValue);
        } else {
            this.unselectSearchResult();
        }
    }
    private requestAddress = async (value: string) => {
        const GEOCODER_ADDRESS = constants.GEOCODER_ADDRESS;
        const SEARCH_RESULT_COUNT = constants.ADDRESS_SEARCH_RESULT_COUNT;
        const center = this.map.getCenter();
        const lat = center.lat;
        const lng = center.lng;
        const requestUrl = `${GEOCODER_ADDRESS}?text=${value}&size=${SEARCH_RESULT_COUNT}&focus.point.lat=${lat}&focus.point.lon=${lng}`; // tslint:disable-line max-line-length

        const response = await ApiClient
            .sendRequest(RequestMethod.GET, encodeURI(requestUrl), {});
        const searchResults = response.features;
        if (searchResults) {
            this.setState({
                searchResults,
            });
        }
    }

    private renderSearchResults = () => {
        const searchResults = this.state.searchResults;
        if (searchResults.length === 0) return null;

        return (
            <div className={s.searchResults}>
                    {
                        searchResults.map((searchResult: ISearchResultFeature, index) => {
                            return this.renderSearchResult(searchResult, index);
                        })
                    }
            </div>
        );
    }

    private renderSearchResult = (searchResult: ISearchResultFeature, searchIndex: number) => {
        const isHighlighted = this.state.searchIndex === searchIndex;
        return (
            <div
                key={searchIndex}
                className={
                    classnames(
                        s.searchResult,
                        isHighlighted ? s.searchResultHighlight : null,
                    )
                }
                onClick={this.setSelectedSearchResult(searchIndex)}
            >
                {searchResult.properties.label}
            </div>
        );
    }

    private setSelectedSearchResult = (_searchIndex?: number) => () => {
        const searchIndex = _searchIndex ? _searchIndex : this.state.searchIndex;
        if (searchIndex === -1) return;

        const selectedSearchResult = this.state.searchResults[searchIndex];
        this.setState({
            selectedSearchResult,
        });
    }

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
