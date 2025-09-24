import { action, computed, observable } from 'mobx'
import IRoutePath from '~/models/IRoutePath'

class RoutePathComparisonStore {
  @observable private _routePath1: IRoutePath | null
  @observable private _routePath2: IRoutePath | null

  constructor() {
    this._routePath1 = null
    this._routePath2 = null
  }

  @computed
  get routePath1(): IRoutePath | null {
    return this._routePath1
  }

  @computed
  get routePath2(): IRoutePath | null {
    return this._routePath2
  }

  @action
  public setRoutePath1 = (routePath: IRoutePath) => {
    this._routePath1 = routePath
  }

  @action
  public setRoutePath2 = (routePath: IRoutePath) => {
    this._routePath2 = routePath
  }

  @action
  public clear = () => {
    this._routePath1 = null
    this._routePath2 = null
  }
}

export default new RoutePathComparisonStore()

export { RoutePathComparisonStore }
