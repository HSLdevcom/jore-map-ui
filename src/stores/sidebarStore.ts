import {action, computed, observable} from 'mobx'

export class SidebarStore {
    @observable private _filters: string[]
    @observable private _selectedLines: [{lintunnus: string, linverkko: string, reitunnus: string}]


    @computed get selectedLines(): [{lintunnus: string, linverkko: string, reitunnus: string}] {
        return this._selectedLines
    }

    @computed get filters(): string[] {
        return this._filters
    }

    @action
    public setSelectedLine(node: {lintunnus: string, linverkko: string, reitunnus: string}) {
        this._selectedLines.push(node)
    }

    @action
    public removeSelectedLines() {
        this._selectedLines = new Array() as [{lintunnus: string, linverkko: string, reitunnus: string}]
    }

    @action
    public setFilters(filters: string[]) {
        this._filters = filters
    }

}

const observableSidebarStore = new SidebarStore()

export default observableSidebarStore
