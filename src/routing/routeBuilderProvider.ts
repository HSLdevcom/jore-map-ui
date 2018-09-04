import * as qs from 'qs';
import RouteBuilder from './routeBuilder';
import { Location } from 'history';
import { Url } from './routing';

export class RouteBuilderProvider {
    private _location: string;
    private _values: any;

    public setLocation(location: Location) {
        this._location = location.pathname;

        const queryValues = qs.parse(
            location.search,
            { ignoreQueryPrefix: true, arrayLimit: 1 },
        );
        this._values = queryValues;
    }

    public to(route: Url) {
        return new RouteBuilder(route.location, this._values);
    }

    public current() {
        return new RouteBuilder(this._location, this._values);
    }

    public getValue(name: string) {
        return this._values[name];
    }

    public getCurrentLocation() {
        return this._location;
    }

    public getCurrentSearchParameters() {
        return this._values;
    }
}

export default new RouteBuilderProvider();
