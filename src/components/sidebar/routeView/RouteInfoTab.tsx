import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { IRoute } from '~/models';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import RouteService from '~/services/routeService';
import { ErrorStore } from '~/stores/errorStore';
import { RouteStore } from '~/stores/routeStore';
import { IValidationResult } from '~/validation/FormValidator';
import InputContainer from '../../controls/InputContainer';
import TextContainer from '../../controls/TextContainer';
import * as s from './routeInfoTab.scss';

interface IRouteInfoTabState {
    isLoading: boolean;
}

interface IRouteInfoTabProps {
    routeStore?: RouteStore;
    errorStore?: ErrorStore;
    isEditingDisabled: boolean;
    isNewRoute: boolean;
    onChangeRouteProperty: (property: keyof IRoute) => (value: any) => void;
    invalidPropertiesMap: object;
    setValidatorResult: (property: string, validationResult: IValidationResult) => void;
}

@inject('routeStore', 'errorStore')
@observer
class RouteInfoTab extends React.Component<IRouteInfoTabProps, IRouteInfoTabState> {
    private existinRouteIds: string[] = [];

    constructor(props: IRouteInfoTabProps) {
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

    private onChangeRouteId = (routeId: string) => {
        this.props.onChangeRouteProperty('id')(routeId);
        if (this.isRouteAlreadyFound(routeId)) {
            const validationResult: IValidationResult = {
                isValid: false,
                errorMessage: `Reitti ${routeId} on jo olemassa.`
            };
            this.props.setValidatorResult('id', validationResult);
        }
    };

    private isRouteAlreadyFound = (routeId: string): boolean => {
        return Boolean(this.existinRouteIds.includes(routeId));
    };

    render() {
        const route = this.props.routeStore!.route;
        if (!route) return null;

        const isEditingDisabled = this.props.isEditingDisabled;
        const isNewRoute = this.props.isNewRoute;
        const isUpdating = !isNewRoute || isEditingDisabled;

        const onChange = this.props.onChangeRouteProperty;
        const invalidPropertiesMap = this.props.invalidPropertiesMap;

        const queryParamLineId = navigator.getQueryParam(QueryParams.lineId);

        return (
            <div className={classnames(s.routeInfoTabView, s.form)}>
                <div className={s.formSection}>
                    <div className={s.flexRow}>
                        <InputContainer
                            disabled={true}
                            label='LINJAN TUNNUS'
                            value={isNewRoute ? queryParamLineId : route.lineId}
                        />
                        <InputContainer
                            disabled={isUpdating}
                            label='REITIN TUNNUS'
                            value={route.id}
                            onChange={this.onChangeRouteId}
                            validationResult={invalidPropertiesMap['id']}
                            capitalizeInput={true}
                        />
                    </div>
                    <div className={s.flexRow}>
                        <InputContainer
                            disabled={isEditingDisabled}
                            label='REITIN NIMI'
                            value={route.routeName}
                            onChange={onChange('routeName')}
                            validationResult={invalidPropertiesMap['routeName']}
                        />
                        <InputContainer
                            disabled={isEditingDisabled}
                            label='REITIN NIMI RUOTSIKSI'
                            value={route.routeNameSw}
                            onChange={onChange('routeNameSw')}
                            validationResult={invalidPropertiesMap['routeNameSw']}
                        />
                    </div>
                    <div className={s.flexRow}>
                        <InputContainer
                            disabled={isEditingDisabled}
                            label='REITIN LYHYT NIMI'
                            value={route.routeNameShort}
                            onChange={onChange('routeNameShort')}
                            validationResult={invalidPropertiesMap['routeNameShort']}
                        />
                        <InputContainer
                            disabled={isEditingDisabled}
                            label='REITIN LYHYT NIMI RUOTSIKSI'
                            value={route.routeNameShortSw}
                            onChange={onChange('routeNameShortSw')}
                            validationResult={invalidPropertiesMap['routeNameShortSw']}
                        />
                    </div>
                    <div className={s.flexRow}>
                        <TextContainer label='MUOKANNUT' value={route.modifiedBy} />
                        <TextContainer
                            label='MUOKATTU PVM'
                            isTimeIncluded={true}
                            value={route.modifiedOn}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
export default RouteInfoTab;
