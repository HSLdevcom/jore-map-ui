import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { Button } from '~/components/controls';
import ButtonType from '~/enums/buttonType';
import { IRoute } from '~/models';
import RouteService from '~/services/routeService';
import { AlertStore } from '~/stores/alertStore';
import { ErrorStore } from '~/stores/errorStore';
import { RouteStore } from '~/stores/routeStore';
import { IValidationResult } from '~/validation/FormValidator';
import RouteForm from './RouteForm';
import * as s from './routeView.scss';

interface IRouteViewState {
    isLoading: boolean;
}

interface IRouteViewProps {
    isEditingDisabled: boolean;
    isNewRoute: boolean;
    onChangeRouteProperty: (property: keyof IRoute) => (value: any) => void;
    invalidPropertiesMap: object;
    setValidatorResult: (property: string, validationResult: IValidationResult) => void;
    routeStore?: RouteStore;
    alertStore?: AlertStore;
    errorStore?: ErrorStore;
}

@inject('routeStore', 'alertStore', 'errorStore')
@observer
class RouteView extends React.Component<IRouteViewProps, IRouteViewState> {
    private existinRouteIds: string[] = [];

    constructor(props: IRouteViewProps) {
        super(props);
        this.state = {
            isLoading: true
        };
    }

    componentDidMount() {
        if (this.props.isNewRoute) {
            this.fetchAllRouteIds();
        }
    }

    componentDidUpdate() {
        if (this.props.isNewRoute) {
            this.fetchAllRouteIds();
        }
    }

    private fetchAllRouteIds = async () => {
        if (this.existinRouteIds.length > 0) return;

        try {
            this.existinRouteIds = await RouteService.fetchAllRouteIds();
        } catch (e) {
            this.props.errorStore!.addError('Olemassa olevien reittien haku ei onnistunut', e);
        }
    };

    // private onChangeRouteId = (routeId: string) => {
    //     this.props.onChangeRouteProperty('id')(routeId);
    //     if (this.isRouteAlreadyFound(routeId)) {
    //         const validationResult: IValidationResult = {
    //             isValid: false,
    //             errorMessage: `Reitti ${routeId} on jo olemassa.`
    //         };
    //         this.props.setValidatorResult('id', validationResult);
    //     }
    // };

    // private isRouteAlreadyFound = (routeId: string): boolean => {
    //     return Boolean(this.existinRouteIds.includes(routeId));
    // };

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
        // TODO:
        // if (this.props.isNewRoute) {
        //     this.navigateToNewRoute();
        //     return;
        // }
        routeStore!.setOldRoute(route);
        routeStore.setRouteToEdit(null);
    };

    render() {
        const route = this.props.routeStore!.route;
        if (!route) return null;

        const isEditingDisabled = this.props.isEditingDisabled;
        const invalidPropertiesMap = this.props.invalidPropertiesMap;
        return (
            <div className={classnames(s.routeView, s.form)}>
                <RouteForm
                    route={route}
                    isNewRoute={false}
                    isEditingDisabled={isEditingDisabled}
                    onChangeRouteProperty={this.props.onChangeRouteProperty}
                    invalidPropertiesMap={invalidPropertiesMap}
                />
                <Button onClick={() => this.save()} type={ButtonType.SAVE}>
                    Luo uusi reitti
                </Button>
            </div>
        );
    }
}
export default RouteView;
