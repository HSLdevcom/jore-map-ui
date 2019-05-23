import regexRules from '~/validation/regexRules';
import { IRoute } from '..';

type RouteKeys = keyof IRoute;
type IRouteValidationModel = { [key in RouteKeys]: string };

const routeValidationModel: IRouteValidationModel = {
    id: `required|min:4|max:6|string|${regexRules.upperCaseOrNumbersOrSpace}`,
    routePaths: '',
    routeName: 'required|min:1|max:60|string',
    routeNameShort: 'required|min:1|max:20|string',
    routeNameSw: 'required|min:1|max:60|string',
    routeNameShortSw: 'required|min:1|max:20|string',
    lineId: 'required|min:4|max:6|string',
    line: '',
    modifiedBy: '',
    modifiedOn: ''
};

export default routeValidationModel;
