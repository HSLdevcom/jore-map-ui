import _ from 'lodash';
import qs from 'qs';
import QueryParams from './queryParams';
import SubSites from './subSites';

class RouteBuilderContext {
    private currentLink: string;
    private linkToBuild: string;
    private queryValues: Record<string, string | string[] | null>;

    constructor(currentLink: string, linkToBuild: SubSites, queryValues: any) {
        this.currentLink = currentLink;
        this.linkToBuild = linkToBuild;

        if (!_.isEmpty(queryValues)) {
            this.queryValues = this.jsonCopy(queryValues);
        } else {
            this.queryValues = {};
        }
    }

    private jsonCopy = (jsonObject: JSON) => {
        return JSON.parse(JSON.stringify(jsonObject));
    };

    public toTarget = (targetId: string, value: string) => {
        if (this.linkToBuild.indexOf(targetId) === -1) {
            throw new Error(
                `Link building error, targetId to replace with value (${value}) not found: ${targetId}`
            );
        }
        this.linkToBuild = this.linkToBuild.replace(targetId, value);
        return this;
    };

    public toLink = () => {
        let link =
            this.linkToBuild !== SubSites.current ? this.linkToBuild.toString() : this.currentLink;

        if (Object.keys(this.queryValues).length !== 0) {
            link += `?${qs.stringify(this.queryValues, { encode: false })}`;
        }
        return link;
    };

    public append = (param: QueryParams, value: string) => {
        const key = String(param);
        const current = this.queryValues[key];

        if (Array.isArray(current)) {
            current.push(value);
        } else if (typeof current === 'string') {
            this.queryValues[key] = [current, value];
        } else {
            this.queryValues[key] = [value];
        }
        return this;
    };

    public remove = (param: QueryParams, value: string) => {
        const key = String(param);
        const current = this.queryValues[key];

        if (Array.isArray(current)) {
            this.queryValues[key] = current.filter((v: string) => v !== value);
        } else if (current !== undefined) {
            this.queryValues[key] = null;
        }

        return this;
    };

    public set = (param: QueryParams, value: string) => {
        this.queryValues[String(param)] = value;
        return this;
    };
}

export default RouteBuilderContext;
