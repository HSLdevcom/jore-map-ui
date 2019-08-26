import RouteBuilderContext from './routeBuilderContext';
import subSites from './subSites';
import Navigator from './navigator';

export class RouteBuilder {
    /**
     * @param {string} subSites
     * @param {Object} queryValues - { field: value, ... }
     */
    public to = (subSites: subSites, queryValues?: any) => {
        return new RouteBuilderContext(
            Navigator.getPathName(),
            subSites,
            queryValues ? queryValues : Navigator.getQueryParamValues()
        );
    };
}

export default new RouteBuilder();
