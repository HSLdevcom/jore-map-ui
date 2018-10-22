import RouteBuilderContext from './routeBuilderContext';
import subSites from './subSites';
import Navigator from './navigator';

export class RouteBuilder {
    public to(subSites: subSites) {
        return new RouteBuilderContext(
            Navigator.getPathName(),
            subSites,
            Navigator.getQueryParamValues(),
        );
    }
}

export default new RouteBuilder();
