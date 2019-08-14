import qs from 'qs';
import SubSites from './subSites';
import QueryParams from './queryParams';

class RouteBuilderContext {
    private currentLocation: string; // current link (rename as currentLink?)
    private target: string; // link to be built (rename as linkToBuild?)
    private values: Object; // TODO: rename as queryString

    constructor(currentLocation: string, target: SubSites, values: any) {
        this.currentLocation = currentLocation;
        this.target = target; // target.replace(':id', '');
        this.values = this.jsonCopy(values);
    }

    private jsonCopy = (jsonObject: JSON) => {
        return JSON.parse(JSON.stringify(jsonObject));
    };

    public toTarget = (value: string) => {
        this.target = this.target.replace(':id', value);
        return this;
    };

    // TODO: remove (edit toTarget)
    public toTarget2 = (targetId: string, value: string) => {
        if (!targetId) {
            this.target = this.target.replace(':id', value);
        } else {
            this.target = this.target.replace(targetId, value);
        }
        // TODO: show error if :targetId is not found

        return this;
    };

    public toLink = () => {
        let link =
            this.target !== SubSites.current
                ? this.target.toString()
                : this.currentLocation;

        if (Object.keys(this.values).length !== 0) {
            link += `?${qs.stringify(this.values, { encode: false })}`;
        }
        return link;
    };

    public append = (param: QueryParams, value: string) => {
        if (param in this.values) {
            this.values[param].push(value);
        } else {
            this.values[param] = [value];
        }
        return this;
    };

    public remove = (param: QueryParams, value: string) => {
        if (param in this.values) {
            if (Array.isArray(this.values[param])) {
                this.values[param] = this.values[param].filter(
                    (v: string) => v !== value
                );
            } else {
                this.values[param] = null;
            }
        }
        return this;
    };

    public set = (param: QueryParams, value: string) => {
        this.values[param] = value;
        return this;
    };

    public clear = () => {
        this.values = {};
        return this;
    };
}

export default RouteBuilderContext;
