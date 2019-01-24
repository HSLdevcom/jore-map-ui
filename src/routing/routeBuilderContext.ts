import qs from 'qs';
import SubSites from './subSites';
import QueryParams from './queryParams';

class RouteBuilderContext {
    private currentLocation: string;
    private target: string;
    private targetId: string;
    private values: Object;

    constructor(currentLocation: string, target: SubSites, values: any) {
        this.currentLocation = currentLocation;
        this.target = target.replace(':id', '');
        this.values = this.jsonCopy(values);
    }

    private jsonCopy = (jsonObject: JSON) => {
        return JSON.parse(JSON.stringify(jsonObject));
    }

    public toTarget = (targetId: string) => {
        this.targetId = targetId;
        return this;
    }

    public toLink = () => {
        let link =
            this.target !== SubSites.current
            ? this.target.toString()
            : this.currentLocation;
        if (this.targetId) {
            link += `${this.targetId}/`;
        }
        if (Object.keys(this.values).length !== 0) {
            link += `?${qs.stringify(this.values, { encode: false })}`;
        }
        return link;
    }

    public append = (param: QueryParams, value: string) => {
        if (param in this.values) {
            this.values[param].push(value);
        } else {
            this.values[param] = [value];
        }
        return this;
    }

    public remove = (param: QueryParams, value: string) => {
        if (param in this.values) {
            if (Array.isArray(this.values[param])) {
                this.values[param] = this.values[param].filter((v : string) => v !== value);
            } else {
                this.values[param] = null;
            }
        }
        return this;
    }

    public set = (param: QueryParams, value: string) => {
        this.values[param] = value;
        return this;
    }

    public clear = () => {
        this.values = {};
        return this;
    }
}

export default RouteBuilderContext;
