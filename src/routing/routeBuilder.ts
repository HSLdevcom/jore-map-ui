export default class RouteBuilder {
    private _target: string;
    private _values: any;

    constructor(target: string, values: any) {
        this._target = target;
        this._values = this.jsonCopy(values);
    }

    private jsonCopy(jsonObject: JSON) {
        return JSON.parse(JSON.stringify(jsonObject));
    }

    public toLink() {
        let search = this._target;
        if (Object.keys(this._target).length !== 0) {
            search += '?';
        }
        for (const property in this._values) {
            if (Array.isArray(this._values[property])) {
                for (const val in this._values[property]) {
                    search += `${property}[]=${this._values[property][val]}&`;
                }
            } else {
                search += `${property}=${this._values[property]}&`;
            }
        }
        return search;
    }

    public append(name: string, value: string) {
        if (name in this._values) {
            this._values[name].push(value);
        } else {
            this._values[name] = [value];
        }
        return this;
    }

    public remove(name: string, value: string) {
        if (name in this._values) {
            if (Array.isArray(this._values[name])) {
                this._values[name] = this._values[name].filter((v : string) => v !== value);
            } else {
                this._values[name] = null;
            }
        }
        return this;
    }

    public set(name: string, value: string) {
        this._values[name] = value;
        return this;
    }

    public clear() {
        this._values = {};
        return this;
    }
}
