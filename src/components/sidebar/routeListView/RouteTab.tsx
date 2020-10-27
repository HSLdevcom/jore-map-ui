import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { ISaveModel } from '~/components/overlays/SavePrompt';
import SaveButton from '~/components/shared/SaveButton';
import Loader from '~/components/shared/loader/Loader';
import { IRoute } from '~/models';
import RouteService from '~/services/routeService';
import { AlertStore } from '~/stores/alertStore';
import { ConfirmStore } from '~/stores/confirmStore';
import { ErrorStore } from '~/stores/errorStore';
import { LoginStore } from '~/stores/loginStore';
import { RouteListStore } from '~/stores/routeListStore';
import { RouteStore } from '~/stores/routeStore';
import { SearchResultStore } from '~/stores/searchResultStore';
import RouteForm from '../routeView/RouteForm';
import * as s from './routeTab.scss';

interface IRouteTabProps {
    route: IRoute;
    isEditing: boolean;
    isNewRoute: boolean;
    routeStore?: RouteStore;
    routeListStore?: RouteListStore;
    loginStore?: LoginStore;
    searchResultStore?: SearchResultStore;
    confirmStore?: ConfirmStore;
    alertStore?: AlertStore;
    errorStore?: ErrorStore;
}

interface IRouteTabState {
    isLoading: boolean;
}

@inject(
    'routeStore',
    'routeListStore',
    'loginStore',
    'searchResultStore',
    'confirmStore',
    'alertStore',
    'errorStore'
)
@observer
class RouteTab extends React.Component<IRouteTabProps, IRouteTabState> {
    private _isMounted: boolean;
    private existinRouteIds: string[] = [];

    constructor(props: IRouteTabProps) {
        super(props);
        this.state = {
            isLoading: false,
        };
    }

    private _setState = (newState: object) => {
        if (this._isMounted) {
            this.setState(newState);
        }
    };

    componentDidMount() {
        this._isMounted = true;
        if (this.props.isNewRoute) {
            this.fetchAllRouteIds();
        }
    }

    componentDidUpdate() {
        if (this.props.isNewRoute) {
            this.fetchAllRouteIds();
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    private fetchAllRouteIds = async () => {
        if (this.existinRouteIds.length > 0) return;

        try {
            this.existinRouteIds = await RouteService.fetchAllRouteIds();
        } catch (e) {
            this.props.errorStore!.addError('Olemassa olevien reittien haku ei onnistunut', e);
        }
    };

    private onChangeRouteProperty = (property: keyof IRoute) => (value: any) => {
        this.props.routeStore!.updateRouteProperty(property, value);
        this.forceUpdate();
    };

    private showSavePrompt = () => {
        const confirmStore = this.props.confirmStore;
        const currentRoute = this.props.routeStore!.route;
        const oldRoute = this.props.routeStore!.oldRoute;
        const saveModel: ISaveModel = {
            type: 'saveModel',
            newData: currentRoute,
            oldData: oldRoute,
            model: 'route',
        };
        const savePromptSection = { models: [saveModel] };
        confirmStore!.openConfirm({
            confirmComponentName: 'savePrompt',
            confirmData: [savePromptSection],
            onConfirm: () => {
                this.save();
            },
        });
    };

    private save = async () => {
        const routeStore = this.props.routeStore!;
        this._setState({ isLoading: true });

        const route = routeStore.route;
        try {
            await RouteService.updateRoute(route!);
            this.props.routeStore!.clear();
            await this.fetchRoute(route.id);
            this.props.searchResultStore!.updateSearchRoute(route.lineId, route);
            this.props.alertStore!.setFadeMessage({ message: 'Tallennettu!' });
        } catch (e) {
            this.props.errorStore!.addError(`Tallennus epäonnistui`, e);
        }
        this.setState({ isLoading: false });
        this.props.routeListStore!.setRouteIdToEdit(null);
    };

    private fetchRoute = async (routeId: string) => {
        const route = await RouteService.fetchRoute({ routeId });
        this.props.routeListStore!.updateRoute(route!);
    };

    render() {
        const routeStore = this.props.routeStore!;
        const isEditing = this.props.isEditing;
        const invalidPropertiesMap = isEditing ? routeStore.invalidPropertiesMap : {};
        const route = isEditing ? routeStore.route : this.props.route;
        if (!route) return null;

        if (this.state.isLoading) {
            return (
                <div className={s.routeTab}>
                    <Loader />
                </div>
            );
        }

        const isSaveButtonDisabled =
            !routeStore.route || !(isEditing && routeStore.isDirty) || !routeStore.isRouteFormValid;
        return (
            <div className={classnames(s.routeTab, s.form)}>
                <RouteForm
                    route={route}
                    isNewRoute={false}
                    isEditing={isEditing}
                    onChangeRouteProperty={this.onChangeRouteProperty}
                    invalidPropertiesMap={invalidPropertiesMap}
                />
                {this.props.loginStore!.hasWriteAccess && isEditing && (
                    <SaveButton
                        onClick={() => this.showSavePrompt()}
                        disabled={isSaveButtonDisabled}
                        savePreventedNotification={''}
                    >
                        Tallenna muutokset
                    </SaveButton>
                )}
            </div>
        );
    }
}
export default RouteTab;
