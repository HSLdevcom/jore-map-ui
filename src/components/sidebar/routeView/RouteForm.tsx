import React from 'react';
import InputContainer from '~/components/controls/InputContainer';
import TextContainer from '~/components/controls/TextContainer';
import { IRoute } from '~/models';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import * as s from './routeForm.scss';

interface IRouteFormProps {
    route: IRoute;
    isNewRoute: boolean;
    isEditingDisabled: boolean;
    onChangeRouteProperty: (property: keyof IRoute) => (value: any) => void;
    invalidPropertiesMap: object;
}

class RouteForm extends React.Component<IRouteFormProps> {
    render() {
        const {
            route,
            isNewRoute,
            invalidPropertiesMap,
            isEditingDisabled,
            onChangeRouteProperty
        } = this.props;
        const onChange = onChangeRouteProperty;
        const isUpdating = !isNewRoute || isEditingDisabled;
        const queryParamLineId = navigator.getQueryParam(QueryParams.lineId);
        return (
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
                        label='NIMI'
                        value={route.routeName}
                        onChange={onChange('routeName')}
                        validationResult={invalidPropertiesMap['routeName']}
                    />
                    <InputContainer
                        disabled={isEditingDisabled}
                        label='NIMI RUOTSIKSI'
                        value={route.routeNameSw}
                        onChange={onChange('routeNameSw')}
                        validationResult={invalidPropertiesMap['routeNameSw']}
                    />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        disabled={isEditingDisabled}
                        label='LYHYT NIMI'
                        value={route.routeNameShort}
                        onChange={onChange('routeNameShort')}
                        validationResult={invalidPropertiesMap['routeNameShort']}
                    />
                    <InputContainer
                        disabled={isEditingDisabled}
                        label='LYHYT NIMI RUOTSIKSI'
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
        );
    }
}

export default RouteForm;
