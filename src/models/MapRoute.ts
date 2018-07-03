class MapRoute {
  get selected(): boolean {
    return this._selected
  }

  set selected(value: boolean) {
    this._selected = value
  }
  get stops(): string {
    return this._stops
  }

  set stops(value: string) {
    this._stops = value
  }
  get route(): string {
    return this._route
  }

  set route(value: string) {
    this._route = value
  }
  get routeName(): string {
    return this._routeName
  }

  set routeName(route: string) {
    this._routeName = route
  }
  private _routeName: string
  private _route: string // TODO what do these actually consist of?
  private _stops: string // TODO same for this
  private _selected: boolean
}