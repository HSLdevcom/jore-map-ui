import React from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
// import TransitType from '~/enums/transitType';
import { RouteStore } from '~/stores/routeStore';
import { ErrorStore } from '~/stores/errorStore';
// import RouteService from '~/services/routeService';
import { IValidationResult } from '~/validation/FormValidator';
// import { TransitToggleButtonBar } from '~/components/controls';
// import InputContainer from '../InputContainer';
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

        // const isEditingDisabled = this.props.isEditingDisabled;
        // const isUpdating = !this.props.isNewRoute || this.props.isEditingDisabled;
        // const onChange = this.props.onChangeRouteProperty;
        // const invalidPropertiesMap = this.props.invalidPropertiesMap;
        // const selectedTransitTypes = route!.transitType ? [route!.transitType!] : [];

        return (
        <div className={classnames(s.routeInfoTabView, s.form)}>
            <div className={s.formSection}>
                <div className={s.flexRow}>
                    <div className={s.formItem}>
                        <div className={s.inputLabel}>
                            VERKKO
                        </div>
                        {/* <TransitToggleButtonBar
                            selectedTransitTypes={selectedTransitTypes}
                            toggleSelectedTransitType={this.selectTransitType}
                            disabled={!this.props.isNewRoute}
                            errorMessage={!route!.transitType ?
                                'Verkon tyyppi täytyy valita.' : undefined}
                        /> */}
                    </div>
                </div>
                <div className={s.flexRow}>
                    {/* <InputContainer
                        disabled={isUpdating}
                        label='LINJAN TUNNUS'
                        value={route.id}
                        onChange={this.onChangeRouteId}
                        validationResult={invalidPropertiesMap['id']}
                    /> */}
                    {/* <InputContainer
                        disabled={isEditingDisabled}
                        label='LINJAN PERUS REITTI'
                        value={route.routeBasicRoute}
                        onChange={onChange('routeBasicRoute')}
                        validationResult={invalidPropertiesMap['routeBasicRoute']}
                    /> */}
                </div>
            </div>
        </div>
        );
    }
}
export default RouteInfoTab;
