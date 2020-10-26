import { inject, observer } from 'mobx-react';
import React from 'react';
import CalculatedInputField from '~/components/controls/CalculatedInputField';
import { IRoutePath } from '~/models';
import { CodeListStore } from '~/stores/codeListStore';
import { RoutePathStore } from '~/stores/routePathStore';
import { toMidnightDate } from '~/utils/dateUtils';
import { Dropdown } from '../../../controls';
import InputContainer from '../../../controls/InputContainer';
import TextContainer from '../../../controls/TextContainer';
import RemoveRoutePathButton from './RemoveRoutePathButton';
import * as s from './routePathInfoTab.scss';

interface IRoutePathInfoTabProps {
    routePathStore?: RoutePathStore;
    codeListStore?: CodeListStore;
    isEditingDisabled: boolean;
    routePath: IRoutePath;
    invalidPropertiesMap: object;
    calculatedRoutePathLength: number | null;
    isRoutePathCalculatedLengthLoading: boolean;
}

@inject('routePathStore', 'codeListStore')
@observer
class RoutePathInfoTab extends React.Component<IRoutePathInfoTabProps> {
    private onChangeRoutePathProperty = (property: keyof IRoutePath) => (value: any) => {
        this.props.routePathStore!.updateRoutePathProperty(property, value);
    };

    render() {
        const routePathStore = this.props.routePathStore!;
        const isEditingDisabled = this.props.isEditingDisabled;
        const isUpdating = !routePathStore!.isNewRoutePath || this.props.isEditingDisabled;
        const invalidPropertiesMap = this.props.invalidPropertiesMap;
        const onChange = this.onChangeRoutePathProperty;
        const routePath = this.props.routePath;
        const routePathPrimaryKeyValidationResult = routePathStore!.invalidPropertiesMap[
            'routePathPrimaryKey'
        ];
        const tomorrowDate = toMidnightDate(new Date());
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        return (
            <div className={s.routePathInfoTabView}>
                <div className={s.form}>
                    <div className={s.formSection}>
                        <div className={s.flexRow}>
                            <Dropdown
                                label='SUUNTA'
                                disabled={isUpdating}
                                selected={this.props.routePath.direction}
                                items={this.props.codeListStore!.getDropdownItemList('Suunta')}
                                onChange={onChange('direction')}
                                validationResult={invalidPropertiesMap['direction']}
                            />
                            <InputContainer
                                label='VOIM. AST'
                                disabled={isUpdating}
                                minStartDate={tomorrowDate}
                                type='date'
                                value={routePath.startDate}
                                onChange={onChange('startDate')}
                                validationResult={invalidPropertiesMap['startDate']}
                            />
                            <InputContainer
                                label='VIIM.VOIM.OLO'
                                disabled={isUpdating}
                                type='date'
                                value={routePath.endDate}
                                onChange={onChange('endDate')}
                                validationResult={invalidPropertiesMap['endDate']}
                            />
                        </div>
                        <div className={s.errorMessage}>
                            {routePathPrimaryKeyValidationResult?.errorMessage}
                        </div>
                        <div className={s.sectionDivider} />
                        <div className={s.flexRow}>
                            <InputContainer
                                label='NIMI SUOMEKSI'
                                disabled={isEditingDisabled}
                                value={routePath.nameFi}
                                onChange={onChange('nameFi')}
                                validationResult={invalidPropertiesMap['nameFi']}
                                data-cy='nameFi'
                            />
                            <InputContainer
                                label='NIMI RUOTSIKSI'
                                disabled={isEditingDisabled}
                                value={routePath.nameSw}
                                onChange={onChange('nameSw')}
                                validationResult={invalidPropertiesMap['nameSw']}
                            />
                        </div>
                        <div className={s.flexRow}>
                            <InputContainer
                                label='LÄHTÖPAIKKA SUOMEKSI'
                                disabled={isEditingDisabled}
                                value={routePath.originFi}
                                onChange={onChange('originFi')}
                                validationResult={invalidPropertiesMap['originFi']}
                            />
                            <InputContainer
                                label='PÄÄTEPAIKKA SUOMEKSI'
                                disabled={isEditingDisabled}
                                value={routePath.destinationFi}
                                onChange={onChange('destinationFi')}
                                validationResult={invalidPropertiesMap['destinationFi']}
                            />
                        </div>
                        <div className={s.flexRow}>
                            <InputContainer
                                label='LÄHTÖPAIKKA RUOTSIKSI'
                                disabled={isEditingDisabled}
                                value={routePath.originSw}
                                onChange={onChange('originSw')}
                                validationResult={invalidPropertiesMap['originSw']}
                            />
                            <InputContainer
                                label='PÄÄTEPAIKKA RUOTSIKSI'
                                disabled={isEditingDisabled}
                                value={routePath.destinationSw}
                                onChange={onChange('destinationSw')}
                                validationResult={invalidPropertiesMap['destinationSw']}
                            />
                        </div>
                        <div className={s.flexRow}>
                            <InputContainer
                                label='LYHENNE SUOMEKSI'
                                disabled={isEditingDisabled}
                                value={routePath.shortNameFi}
                                onChange={onChange('shortNameFi')}
                                validationResult={invalidPropertiesMap['shortNameFi']}
                            />
                            <InputContainer
                                label='LYHENNE RUOTSIKSI'
                                disabled={isEditingDisabled}
                                value={routePath.shortNameSw}
                                onChange={onChange('shortNameSw')}
                                validationResult={invalidPropertiesMap['shortNameSw']}
                            />
                        </div>
                        <div className={s.flexRow}>
                            <Dropdown
                                label='POIKKEUSREITTI'
                                disabled={isEditingDisabled}
                                selected={this.props.routePath.exceptionPath}
                                items={this.props.codeListStore!.getDropdownItemList('Kyllä/Ei')}
                                onChange={onChange('exceptionPath')}
                                validationResult={invalidPropertiesMap['exceptionPath']}
                            />
                            <CalculatedInputField
                                routePathLinks={routePath.routePathLinks}
                                label='PITUUS (m)'
                                isDisabled={isEditingDisabled}
                                onChange={onChange('length')}
                                validationResult={invalidPropertiesMap['length']}
                                value={routePath.length}
                                calculatedRoutePathLength={this.props.calculatedRoutePathLength}
                                isRoutePathCalculatedLengthLoading={
                                    this.props.isRoutePathCalculatedLengthLoading
                                }
                            />
                        </div>
                        <div className={s.flexRow}>
                            <TextContainer label='MUOKANNUT' value={routePath.modifiedBy} />
                            <TextContainer
                                label='MUOKATTU PVM'
                                isTimeIncluded={true}
                                value={routePath.modifiedOn}
                            />
                        </div>
                        {!routePathStore.isNewRoutePath && (
                            <div className={s.flexRow}>
                                <RemoveRoutePathButton />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}
export default RoutePathInfoTab;
