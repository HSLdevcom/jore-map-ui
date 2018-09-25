import qs from 'qs';
import SubSites from './subSites';
import QueryParams from './queryParams';

export default class RouteBuilderContext {
    private _currentLocation: string;
    private _target: SubSites;
    private _values: any;

    constructor(currentLocation: string, target: SubSites, values: any) {
        this._currentLocation = currentLocation;
        this._target = target;
        this._values = this.jsonCopy(values);
    }

    private jsonCopy(jsonObject: JSON) {
        return JSON.parse(JSON.stringify(jsonObject));
    }

    public toLink() {
        let link =
            this._target !== SubSites.current
            ? this._target.toString()
            : this._currentLocation;
        if (Object.keys(this._values).length !== 0) {
            link += `?${qs.stringify(this._values, { encode: false })}`;
        }
        return link;
    }

    public append(param: QueryParams, value: string) {
        if (param in this._values) {
            this._values[param].push(value);
        } else {
            this._values[param] = [value];
        }
        return this;
    }

    public remove(param: QueryParams, value: string) {
        if (param in this._values) {
            if (Array.isArray(this._values[param])) {
                this._values[param] = this._values[param].filter((v : string) => v !== value);
            } else {
                this._values[param] = null;
            }
        }
        return this;
    }

    public set(param: QueryParams, value: string) {
        this._values[param] = value;
        return this;
    }

    public clear() {
        this._values = {};
        return this;
    }
}
