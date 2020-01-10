import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { Button } from '~/components/controls';
import ButtonType from '~/enums/buttonType';
import RouteFactory from '~/factories/routeFactory';
import { IRoute } from '~/models';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import RouteService from '~/services/routeService';
import { AlertStore } from '~/stores/alertStore';
import { ErrorStore } from '~/stores/errorStore';
import { MapStore } from '~/stores/mapStore';
import { RouteStore } from '~/stores/routeStore';
import SidebarHeader from '../SidebarHeader';
import RouteForm from './RouteForm';
import * as s from './newRouteView.scss';

interface IRouteViewState {
    isLoading: boolean;
}

interface IRouteViewProps {
    isEditingDisabled: boolean;
    isNewRoute: boolean;
    route?: IRoute;
    routeStore?: RouteStore;
    mapStore?: MapStore;
    alertStore?: AlertStore;
    errorStore?: ErrorStore;
}

@inject('routeStore', 'mapStore', 'alertStore', 'errorStore')
@observer
class NewRouteView extends React.Component<IRouteViewProps, IRouteViewState> {
    constructor(props: IRouteViewProps) {
        super(props);
        this.state = {
            isLoading: true
        };
    }

    componentDidMount() {
        this.fetchAllRouteIds();
        this.createNewRoute();
    }

    componentDidUpdate() {
        this.fetchAllRouteIds();
    }

    componentWillUnmount() {
        this.props.routeStore!.clear();
    }

    private fetchAllRouteIds = async () => {
        if (this.props.routeStore!.existingRouteIds.length > 0) return;

        try {
            const existinRouteIds = await RouteService.fetchAllRouteIds();
            this.props.routeStore!.setExistingRouteIds(existinRouteIds);
        } catch (e) {
            this.props.errorStore!.addError('Olemassa olevien reittien haku ei onnistunut', e);
        }
    };

    private createNewRoute = async () => {
        this.props.mapStore!.initCoordinates();

        try {
            const lineId = navigator.getQueryParam(QueryParams.lineId);
            const newRoute = RouteFactory.createNewRoute(lineId);
            this.props.routeStore!.init({ route: newRoute, isNewRoute: true });
        } catch (e) {
            this.props.errorStore!.addError('Uuden reitin luonti epäonnistui', e);
        }

        this.setState({
            isLoading: false
        });
    };

    private save = async () => {
        const routeStore = this.props.routeStore!;
        this.setState({ isLoading: true });

        const route = routeStore.route;
        try {
            await RouteService.createRoute(route!);
            this.props.alertStore!.setFadeMessage({ message: 'Tallennettu!' });
        } catch (e) {
            this.props.errorStore!.addError(`Tallennus epäonnistui`, e);
            return;
        }
        this.redirectToLineView();
    };

    private redirectToLineView = () => {
        const lineId = navigator.getQueryParam(QueryParams.lineId);
        const lineViewLink = routeBuilder
            .to(SubSites.line)
            .toTarget(':id', lineId)
            .toLink();
        navigator.goTo({ link: lineViewLink, shouldSkipUnsavedChangesPrompt: true });
    };

    private onChangeRouteProperty = (property: keyof IRoute) => (value: any) => {
        this.props.routeStore!.updateRouteProperty(property, value);
        this.forceUpdate();
    };

    render() {
        const routeStore = this.props.routeStore!;
        const isEditingDisabled = this.props.isEditingDisabled;
        const invalidPropertiesMap = isEditingDisabled ? {} : routeStore.invalidPropertiesMap;
        const route = isEditingDisabled ? this.props.route : routeStore.route;
        const lineId = navigator.getQueryParam(QueryParams.lineId);
        if (!route) return null;
        return (
            <div className={classnames(s.routeView, s.form)}>
                <SidebarHeader
                    isEditButtonVisible={false}
                    isEditing={true}
                    shouldShowClosePromptMessage={this.props.routeStore!.isDirty}
                >
                    <div>Luo uusi reitti linjalle {lineId}</div>
                </SidebarHeader>
                <RouteForm
                    route={route}
                    isNewRoute={true}
                    isEditingDisabled={isEditingDisabled}
                    onChangeRouteProperty={this.onChangeRouteProperty}
                    invalidPropertiesMap={invalidPropertiesMap}
                />
                <Button onClick={() => this.save()} type={ButtonType.SAVE}>
                    Luo uusi reitti
                </Button>
            </div>
        );
    }
}
export default NewRouteView;
