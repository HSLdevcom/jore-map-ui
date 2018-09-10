import qs from 'qs';
import SubSites from './subSites';
import QueryParams from './queryParams';

export default class RouteBuilderContext {
    private _target: string;
    private _values: any;

    constructor(target: SubSites | string, values: any) {
        this._target = target;
        this._values = this.jsonCopy(values);
    }

    private jsonCopy(jsonObject: JSON) {
        return JSON.parse(JSON.stringify(jsonObject));
    }

    public toLink() {
        let search = this._target.toString();
        if (Object.keys(this._values).length !== 0) {
            search += `?${qs.stringify(this._values, { encode: false })}`;
        }
        return search;
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
