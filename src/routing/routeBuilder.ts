import Navigator from './navigator'
import RouteBuilderContext from './routeBuilderContext'
import subSites from './subSites'

export class RouteBuilder {
  /**
   * @param {string} subSites
   * @param {Object} queryValues - { field: value, ... } (use navigator.getQueryParamValues() for example)
   */
  public to = (subSites: subSites, queryValues?: any) => {
    return new RouteBuilderContext(Navigator.getPathName(), subSites, queryValues)
  }
}

export default new RouteBuilder()
