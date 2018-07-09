import {action, computed, observable} from 'mobx'

export class SidebarStore {
    @observable private routes: number[]
    @observable private showRouteSearch: boolean

    constructor() {
        this.routes = []
        this.showRouteSearch = true
    }

    @computed get getShowRouteSearch(): boolean {
        return this.showRouteSearch
    }

    @computed get getRoutes(): number[] {
        return this.routes
    }

    @action
    public setRoutes(routes: number[]) {
        this.routes = routes
    }

}

const observableSidebarStore = new SidebarStore()

export default observableSidebarStore
