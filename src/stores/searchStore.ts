import { action, computed, makeObservable, observable } from 'mobx';
import TransitType from '~/enums/transitType';

class SearchStore {
    private _searchInput: string;
    private _selectedTransitTypes: TransitType[];
    private _isSearchingForLines: boolean;
    private _isSearchingForNodes: boolean;
    private _areInactiveLinesHidden: boolean;
    private _isSearchDisabled: boolean;
    private _isLoading: boolean;

    constructor() {
        makeObservable<
            SearchStore,
            | '_searchInput'
            | '_selectedTransitTypes'
            | '_isSearchingForLines'
            | '_isSearchingForNodes'
            | '_areInactiveLinesHidden'
            | '_isSearchDisabled'
            | '_isLoading'
        >(this, {
            _searchInput: observable,
            _selectedTransitTypes: observable,
            _isSearchingForLines: observable,
            _isSearchingForNodes: observable,
            _areInactiveLinesHidden: observable,
            _isSearchDisabled: observable,
            _isLoading: observable,

            searchInput: computed,
            selectedTransitTypes: computed,
            isSearchingForLines: computed,
            isSearchingForNodes: computed,
            areInactiveLinesHidden: computed,
            isSearchDisabled: computed,
            isLoading: computed,

            setSearchInput: action,
            toggleIsSearchingForLines: action,
            toggleIsSearchingForNodes: action,
            toggleAreInactiveLinesHidden: action,
            toggleTransitType: action,
            setIsSearchDisabled: action,
            setIsLoading: action,
        });

        this._searchInput = '';
        this._selectedTransitTypes = [
            TransitType.BUS,
            TransitType.FERRY,
            TransitType.SUBWAY,
            TransitType.TRAIN,
            TransitType.TRAM,
        ];
        this._isSearchingForLines = true;
        this._isSearchingForNodes = false;
        this._areInactiveLinesHidden = true;
        this._isSearchDisabled = false;
        this._isLoading = false;
    }

    get searchInput(): string {
        return this._searchInput;
    }

    public setSearchInput = (input: string) => {
        this._searchInput = input;
    };

    get selectedTransitTypes(): TransitType[] {
        return this._selectedTransitTypes;
    }

    get isSearchingForLines() {
        return this._isSearchingForLines;
    }

    get isSearchingForNodes() {
        return this._isSearchingForNodes;
    }

    get areInactiveLinesHidden(): boolean {
        return this._areInactiveLinesHidden;
    }

    get isSearchDisabled() {
        return this._isSearchDisabled;
    }

    get isLoading() {
        return this._isLoading;
    }

    public toggleIsSearchingForLines() {
        this._isSearchingForLines = true;
        this._isSearchingForNodes = false;
    }

    public toggleIsSearchingForNodes() {
        this._isSearchingForNodes = true;
        this._isSearchingForLines = false;
    }

    public toggleAreInactiveLinesHidden() {
        this._areInactiveLinesHidden = !this._areInactiveLinesHidden;
    }

    public toggleTransitType = (type: TransitType) => {
        if (this._selectedTransitTypes.includes(type)) {
            this._selectedTransitTypes = this._selectedTransitTypes.filter((t) => t !== type);
        } else {
            this._selectedTransitTypes = this._selectedTransitTypes.concat(type);
        }
    };

    public setIsSearchDisabled(isSearchDisabled: boolean) {
        this._isSearchDisabled = isSearchDisabled;
    }

    public setIsLoading(isLoading: boolean) {
        this._isLoading = isLoading;
        console.log('setIsLoading', isLoading);
    }
}

export default new SearchStore();
export { SearchStore };