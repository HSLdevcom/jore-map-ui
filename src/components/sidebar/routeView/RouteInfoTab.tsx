import React from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import { RouteStore } from '~/stores/routeStore';
import { ErrorStore } from '~/stores/errorStore';
import { IValidationResult } from '~/validation/FormValidator';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import InputContainer from '../InputContainer';
import * as s from './routeInfoTab.scss';

interface IRouteInfoTabState {
    isLoading: boolean;
}

interface IRouteInfoTabProps {
    routeStore?: RouteStore;
    errorStore?: ErrorStore;
    isEditingDisabled: boolean;
    isNewRoute: boolean;
    onChangeRouteProperty: (property: string) => (value: any) => void;
    invalidPropertiesMap: object;
    setValidatorResult: (property: string, validationResult: IValidationResult) => void;
}

@inject('routeStore', 'errorStore')
@observer
class RouteInfoTab extends React.Component<IRouteInfoTabProps, IRouteInfoTabState>{
    constructor(props: any) {
        super(props);
        this.state = {
            isLoading: true,
        };
    }

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
                        onChange={onChange('id')}
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
                    <InputContainer
                        disabled={true}
                        label='MUOKANNUT'
                        value={'-'}
                    />
                    <InputContainer
                        disabled={true}
                        label='MUOKATTU PVM'
                        value={'-'}
                    />
                </div>
            </div>
        </div>
        );
    }
}
export default RouteInfoTab;
