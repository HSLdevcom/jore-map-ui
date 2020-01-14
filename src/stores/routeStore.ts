import _ from 'lodash';
import { action, computed, observable, reaction } from 'mobx';
import { IRoute } from '~/models';
import routeValidationModel, {
    IRouteValidationModel
} from '~/models/validationModels/routeValidationModel';
import { IValidationResult } from '~/validation/FormValidator';
import NavigationStore from './navigationStore';
import SearchStore from './searchStore';
import ValidationStore, { ICustomValidatorMap } from './validationStore';

class RouteStore {
    @observable private _route: IRoute | null;
    @observable private _oldRoute: IRoute | null;
    @observable private _isNewRoute: boolean;
    @observable private _existingRouteIds: string[] = [];
    @observable private _routeIdToEdit: string | null;
    private _validationStore: ValidationStore<IRoute, IRouteValidationModel>;

    constructor() {
        this._validationStore = new ValidationStore();

        reaction(
            () => this.isDirty && this._routeIdToEdit != null,
            (value: boolean) => NavigationStore.setShouldShowUnsavedChangesPrompt(value)
        );
        reaction(
            () => this._routeIdToEdit != null,
            (value: boolean) => SearchStore.setIsSearchDisabled(value)
        );
    }

    @computed
    get route(): IRoute {
        return this._route!;
    }

    @computed
    get oldRoute(): IRoute {
        return this._oldRoute!;
    }

    @computed
    get isNewRoute(): boolean {
        return this._isNewRoute;
    }

    @computed
    get existingRouteIds(): string[] {
        return this._existingRouteIds;
    }

    @computed
    get routeIdToEdit(): string | null {
        return this._routeIdToEdit;
    }

    @computed
    get isDirty() {
        // line and routePaths can't change in routeView, omit them from
        // the comparison to prevent lag
        return !_.isEqual(
            _.omit(this._route, ['line', 'routePaths']),
            _.omit(this._oldRoute, ['line', 'routePaths'])
        );
    }

    @computed
    get invalidPropertiesMap() {
        return this._validationStore.getInvalidPropertiesMap();
    }

    @computed
    get isRouteFormValid() {
        return this._validationStore.isValid();
    }

    @action
    public init = ({ route, isNewRoute }: { route: IRoute; isNewRoute: boolean }) => {
        this._route = _.cloneDeep(route);
        this.setOldRoute(route);
        this._isNewRoute = isNewRoute;
        const customValidatorMap: ICustomValidatorMap = {
            id: {
                validator: (route: IRoute, property: string, routeId: string) => {
                    if (!this._isNewRoute) return;
                    if (Boolean(this._existingRouteIds.includes(routeId))) {
                        const validationResult: IValidationResult = {
                            isValid: false,
                            errorMessage: `Reitti ${routeId} on jo olemassa.`
                        };
                        return validationResult;
                    }
                    return;
                }
            }
        };
        this._validationStore.init(this._route, routeValidationModel, customValidatorMap);
    };

    @action
    public setRouteToEdit = (route: IRoute | null) => {
        if (!route) {
            this._routeIdToEdit = null;
            return;
        }
        if (route.id === this._routeIdToEdit) {
            this.resetChanges();
            this._routeIdToEdit = null;
        } else {
            this.init({ route, isNewRoute: false });
            this._routeIdToEdit = route.id;
        }
    };

    @action
    public setOldRoute = (route: IRoute) => {
        this._oldRoute = _.cloneDeep(route);
    };

    @action
    public updateRouteProperty = (property: keyof IRoute, value: string | number | Date) => {
        (this._route as any)[property] = value;
        this._validationStore.updateProperty(property, value);
    };

    @action
    public setExistingRouteIds = (existingRouteIds: string[]) => {
        this._existingRouteIds = existingRouteIds;
    };

    @action
    public clear = () => {
        this._route = null;
        this._oldRoute = null;
        this._validationStore.clear();
        this._routeIdToEdit = null;
    };

    @action
    public resetChanges = () => {
        if (this._oldRoute) {
            this.init({ route: this._oldRoute, isNewRoute: this._isNewRoute });
        }
    };
}

export default new RouteStore();

export { RouteStore };
