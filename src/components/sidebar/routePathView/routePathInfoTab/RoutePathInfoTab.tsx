import React from 'react';
import { observer, inject } from 'mobx-react';
import { IRoutePath } from '~/models';
import { RoutePathStore } from '~/stores/routePathStore';
import { CodeListStore } from '~/stores/codeListStore';
import routeBuilder from '~/routing/routeBuilder';
import routePathValidationModel from '~/models/validationModels/routePathValidationModel';
import SubSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import CalculatedInputField from '~/components/controls/CalculatedInputField';
import { IValidationResult } from '~/validation/FormValidator';
import { IRoutePathPrimaryKey } from '~/models/IRoutePath';
import RoutePathService from '~/services/routePathService';
import QueryParams from '~/routing/queryParams';
import InputContainer from '../../InputContainer';
import TextContainer from '../../TextContainer';
import LinkListView from './LinkListView';
import { Button, Dropdown } from '../../../controls';
import ButtonType from '../../../../enums/buttonType';
import * as s from './routePathInfoTab.scss';

interface IRoutePathInfoTabProps {
    routePathStore?: RoutePathStore;
    codeListStore?: CodeListStore;
    isEditingDisabled: boolean;
    routePath: IRoutePath;
    isNewRoutePath: boolean;
    onChange: (property: string) => (value: any) => void;
    invalidPropertiesMap: object;
    setValidatorResult: (
        property: string,
        validationResult: IValidationResult
    ) => void;
}

@inject('routePathStore', 'codeListStore')
@observer
class RoutePathInfoTab extends React.Component<IRoutePathInfoTabProps> {
    existingRoutePathPrimaryKeys: IRoutePathPrimaryKey[];

    componentDidMount() {
        const queryParams = navigator.getQueryParamValues();
        const routeId = queryParams[QueryParams.routeId];
        this.fetchExistingPrimaryKeys(routeId);
    }

    private redirectToNewRoutePathView = () => {
        const routePath = this.props.routePathStore!.routePath;
        if (!routePath) return;

        const newRoutePathLink = routeBuilder
            .to(SubSites.newRoutePath, {
                routeId: routePath.routeId,
                lineId: routePath.lineId
            })
            .toLink();

        navigator.goTo(newRoutePathLink);
    };

    private fetchExistingPrimaryKeys = async (routeId: string) => {
        this.existingRoutePathPrimaryKeys = await RoutePathService.fetchAllRoutePathPrimaryKeys(
            routeId
        );
    };

    private showAlertPlanningInProgress = () => {
        window.alert('Toteutuksen suunnittelu kesken.');
    };

    private updateLength = () => {
        this.props.routePathStore!.updateRoutePathProperty(
            'length',
            this.props.routePathStore!.getCalculatedLength()
        );
    };

    private isPrimaryKeyDuplicated = () => {
        const routePath = this.props.routePathStore!.routePath!;

        return this.existingRoutePathPrimaryKeys.some(
            rp =>
                routePath.routeId === rp.routeId &&
                routePath.direction === rp.direction &&
                routePath.startTime.getTime() === rp.startTime.getTime()
        );
    };

    private validatePrimaryKey = (direction: string, startTime: Date) => {
        this.props.onChange('direction')(direction);
        this.props.onChange('startTime')(startTime);

        if (this.props.isNewRoutePath && this.isPrimaryKeyDuplicated()) {
            const validationResult: IValidationResult = {
                isValid: false,
                errorMessage:
                    'Reitinsuunta samalla reitillä, suunnalla ja alkupäivämäärällä on jo olemassa.'
            };
            this.props.setValidatorResult('direction', validationResult);
        }
    };

    private onChangeDirection = (direction: string) => {
        const startTime = this.props.routePathStore!.routePath!.startTime;
        this.validatePrimaryKey(direction, startTime);
    };

    private onChangeStartTime = (startTime: Date) => {
        const direction = this.props.routePathStore!.routePath!.direction;
        this.validatePrimaryKey(direction, startTime);
    };

    render() {
        const isEditingDisabled = this.props.isEditingDisabled;
        const isUpdating =
            !this.props.isNewRoutePath || this.props.isEditingDisabled;
        const invalidPropertiesMap = this.props.invalidPropertiesMap;
        const onChange = this.props.onChange;

        const routePath = this.props.routePath;
        return (
            <div className={s.routePathInfoTabView}>
                <div className={s.form}>
                    <div className={s.formSection}>
                        <div className={s.flexRow}>
                            <TextContainer
                                label='REITIN NIMI SUOMEKSI'
                                value={routePath.routePathName}
                            />
                            <TextContainer
                                label='REITIN NIMI RUOTSIKSI'
                                value={routePath.routePathNameSw}
                            />
                        </div>
                        <div className={s.flexRow}>
                            <InputContainer
                                label='LÄHTÖPAIKKA SUOMEKSI'
                                disabled={isEditingDisabled}
                                value={routePath.originFi}
                                onChange={onChange('originFi')}
                                validationResult={
                                    invalidPropertiesMap['originFi']
                                }
                            />
                            <InputContainer
                                label='PÄÄTEPAIKKA SUOMEKSI'
                                disabled={isEditingDisabled}
                                value={routePath.destinationFi}
                                onChange={onChange('destinationFi')}
                                validationResult={
                                    invalidPropertiesMap['destinationFi']
                                }
                            />
                        </div>
                        <div className={s.flexRow}>
                            <InputContainer
                                label='LÄHTÖPAIKKA RUOTSIKSI'
                                disabled={isEditingDisabled}
                                value={routePath.originSw}
                                onChange={onChange('originSw')}
                                validationResult={
                                    invalidPropertiesMap['originSw']
                                }
                            />
                            <InputContainer
                                label='PÄÄTEPAIKKA RUOTSIKSI'
                                disabled={isEditingDisabled}
                                value={routePath.destinationSw}
                                onChange={onChange('destinationSw')}
                                validationResult={
                                    invalidPropertiesMap['destinationSw']
                                }
                            />
                        </div>
                        <div className={s.flexRow}>
                            <InputContainer
                                label='LYHENNE SUOMEKSI'
                                disabled={isEditingDisabled}
                                value={routePath.routePathShortName}
                                onChange={onChange('routePathShortName')}
                                validationResult={
                                    invalidPropertiesMap['routePathShortName']
                                }
                            />
                            <InputContainer
                                label='LYHENNE RUOTSIKSI'
                                disabled={isEditingDisabled}
                                value={routePath.routePathShortNameSw}
                                onChange={onChange('routePathShortNameSw')}
                                validationResult={
                                    invalidPropertiesMap['routePathShortNameSw']
                                }
                            />
                        </div>
                        <div className={s.flexRow}>
                            <InputContainer
                                label='VOIM. AST'
                                disabled={isUpdating}
                                type='date'
                                value={routePath.startTime}
                                onChange={this.onChangeStartTime}
                                validationResult={
                                    invalidPropertiesMap['startTime']
                                }
                            />
                            <InputContainer
                                label='VIIM.VOIM.OLO'
                                disabled={this.props.isEditingDisabled}
                                type='date'
                                value={routePath.endTime}
                                onChange={onChange('endTime')}
                                validationResult={
                                    invalidPropertiesMap['endTime']
                                }
                            />
                            <CalculatedInputField
                                label='PITUUS (m)'
                                calculatedValue={this.props.routePathStore!.getCalculatedLength()}
                                isDisabled={isEditingDisabled}
                                onChange={onChange('length')}
                                useCalculatedValue={this.updateLength}
                                validatorRule={routePathValidationModel.length}
                                validationResult={
                                    invalidPropertiesMap['length']
                                }
                                value={routePath.length}
                            />
                        </div>
                        <div className={s.flexRow}>
                            <Dropdown
                                label='SUUNTA'
                                disabled={isUpdating}
                                selected={this.props.routePath.direction}
                                items={this.props.codeListStore!.getCodeList(
                                    'Suunta'
                                )}
                                onChange={this.onChangeDirection}
                                validationResult={
                                    invalidPropertiesMap['direction']
                                }
                            />
                            <Dropdown
                                label='POIKKEUSREITTI'
                                disabled={isEditingDisabled}
                                selected={this.props.routePath.exceptionPath}
                                items={this.props.codeListStore!.getCodeList(
                                    'Kyllä/Ei'
                                )}
                                onChange={onChange('exceptionPath')}
                                validationResult={
                                    invalidPropertiesMap['exceptionPath']
                                }
                            />
                        </div>
                        <div className={s.flexRow}>
                            <TextContainer
                                label='PÄIVITYSPVM'
                                value={routePath.lastModified}
                            />
                            <TextContainer
                                label='PÄIVITTÄJÄ'
                                value={routePath.modifiedBy}
                            />
                        </div>
                    </div>
                    <div className={s.formSection}>
                        <div className={s.buttonBar}>
                            <Button
                                onClick={this.showAlertPlanningInProgress}
                                type={ButtonType.ROUND}
                            >
                                Varustelutiedot
                            </Button>
                            <Button
                                onClick={this.showAlertPlanningInProgress}
                                type={ButtonType.ROUND}
                            >
                                Solmut Exceliin
                            </Button>
                            <Button
                                onClick={this.showAlertPlanningInProgress}
                                type={ButtonType.ROUND}
                            >
                                Aikataulu
                            </Button>
                            <Button
                                type={ButtonType.ROUND}
                                onClick={this.redirectToNewRoutePathView!}
                            >
                                Kopioi
                            </Button>
                        </div>
                    </div>
                    <div className={s.formSection}>
                        <div className={s.formItem}>KARTTA</div>
                        <div className={s.formItem}>
                            Esitettävien ajoaikojen kausi ja aikajakso (Toteutus
                            / suunnittelu kesken)
                            <div className={s.flexInnerRow}>
                                {/* TODO */}
                                <Dropdown
                                    onChange={onChange('foo')}
                                    disabled={isEditingDisabled}
                                    items={this.props.codeListStore!.getCodeList(
                                        'Suunta'
                                    )}
                                    selected='Suunta 1'
                                />
                                {/* TODO */}
                                <Dropdown
                                    onChange={onChange('foo')}
                                    disabled={isEditingDisabled}
                                    items={this.props.codeListStore!.getCodeList(
                                        'Suunta'
                                    )}
                                    selected='Suunta 2'
                                />
                            </div>
                        </div>
                    </div>
                    <div className={s.formSection}>
                        <LinkListView routePath={this.props.routePath} />
                    </div>
                </div>
            </div>
        );
    }
}
export default RoutePathInfoTab;
