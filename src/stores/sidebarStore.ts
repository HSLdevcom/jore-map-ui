import {action, computed, observable} from 'mobx'

interface ISelectedLine {
    lintunnus: string,
    linverkko: string,
    reitunnus: string
}

export class SidebarStore {
    @observable private _filters: string[]
    @observable private _selectedLines: ISelectedLine[]

    constructor() {
        this._selectedLines = new Array<ISelectedLine>()
    }

    @computed get selectedLines(): ISelectedLine[] {
        return this._selectedLines
    }

    @computed get filters(): string[] {
        return this._filters
    }

    @action
    public setSelectedLine(node: ISelectedLine) {
        this._selectedLines.push(node)
    }

    @action
    public removeSelectedLines() {
        this._selectedLines = new Array<ISelectedLine>()
    }

    @action
    public setFilters(filters: string[]) {
        this._filters = filters
    }
}

const observableSidebarStore = new SidebarStore()

export default observableSidebarStore
