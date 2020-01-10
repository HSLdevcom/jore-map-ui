import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { IRoute } from '~/models';
import RouteService from '~/services/routeService';
import { ErrorStore } from '~/stores/errorStore';
import { RouteStore } from '~/stores/routeStore';
import RouteForm from '../routeView/RouteForm';
import * as s from './routeTab.scss';

interface IRouteTabProps {
    route: IRoute;
    isEditingDisabled: boolean;
    isNewRoute: boolean;
    routeStore?: RouteStore;
    errorStore?: ErrorStore;
}

interface IRouteTabState {
    isLoading: boolean;
}

@inject('routeStore', 'errorStore')
@observer
class RouteTab extends React.Component<IRouteTabProps, IRouteTabState> {
    private existinRouteIds: string[] = [];

    constructor(props: IRouteTabProps) {
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

    private onChangeRouteProperty = (property: keyof IRoute) => (value: any) => {
        this.props.routeStore!.updateRouteProperty(property, value);
        this.forceUpdate();
    };

    render() {
        const routeStore = this.props.routeStore!;
        const isEditingDisabled = this.props.isEditingDisabled;
        const invalidPropertiesMap = isEditingDisabled ? {} : routeStore.invalidPropertiesMap;
        const route = isEditingDisabled ? this.props.route : routeStore.route;
        if (!route) return null;
        return (
            <div className={classnames(s.routeTab, s.form)}>
                <RouteForm
                    route={route}
                    isNewRoute={false}
                    isEditingDisabled={isEditingDisabled}
                    onChangeRouteProperty={this.onChangeRouteProperty}
                    invalidPropertiesMap={invalidPropertiesMap}
                />
            </div>
        );
    }
}
export default RouteTab;
