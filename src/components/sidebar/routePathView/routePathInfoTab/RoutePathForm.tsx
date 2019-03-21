import React from 'react';
import { observer, inject } from 'mobx-react';
import { FiRefreshCw } from 'react-icons/fi';
import classnames from 'classnames';
import { IRoutePath } from '~/models';
import { RoutePathStore } from '~/stores/routePathStore';
import booleanCodeList from '~/codeLists/booleanCodeList';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import directionCodeList from '~/codeLists/directionCodeList';
import navigator from '~/routing/navigator';
import routePathValidationModel from '~/validation/models/routePathValidationModel';
import { IValidationResult } from '~/validation/FormValidator';
import InputContainer from '../../InputContainer';
import TextContainer from '../../TextContainer';
import LinkListView from './LinkListView';
import { Button, Dropdown } from '../../../controls';
import ButtonType from '../../../../enums/buttonType';
import * as s from './routePathForm.scss';

interface IRoutePathFormProps {
    routePathStore?: RoutePathStore;
    isEditingDisabled: boolean;
    routePath: IRoutePath;
    isNewRoutePath: boolean;
    markInvalidProperties: (property: string, isValid: boolean) => void;
}

@inject('routePathStore')
@observer
class RoutePathForm extends React.Component<IRoutePathFormProps>{
    private onChange = (property: string) =>
        (value: any, validationResult?: IValidationResult) => {
            this.props.routePathStore!.updateRoutePathProperty(property, value);
            if (validationResult) {
                this.props.markInvalidProperties(property, validationResult.isValid);
            }
        }

    private redirectToNewRoutePathView = () => {
        const routePath = this.props.routePathStore!.routePath;
        if (!routePath) return;

        const newRoutePathLink = routeBuilder
            .to(SubSites.newRoutePath, { routeId: routePath.routeId, lineId: routePath.lineId })
            .toLink();

        navigator.goTo(newRoutePathLink);
    }

    private showAlertPlanningInProgress = () => {
        window.alert('Toteutuksen suunnittelu kesken.');
    }

    private updateLength = () => {
        this.props.routePathStore!.updateRoutePathProperty(
            'length',
            this.props.routePathStore!.getCalculatedLength(),
        );
    }

    private renderLengthLabel = () => {
        const isEditingDisabled = this.props.isEditingDisabled;

        return (
            <>
                PITUUS
                <div
                    className={classnames(s.lengthIcon, isEditingDisabled ? s.disabled : '')}
                    onClick={this.updateLength}
                >
                    <FiRefreshCw/>
                </div>
            </>
        );
    }

    render() {
        const isEditingDisabled = this.props.isEditingDisabled;
        const disabledIfUpdating = !this.props.isNewRoutePath || this.props.isEditingDisabled;

        const routePath = this.props.routePath;
        return (
        <div className={classnames(s.form, s.routePathForm)}>
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
                        onChange={this.onChange('originFi')}
                        validatorRule={routePathValidationModel.origin}
                    />
                    <InputContainer
                        label='PÄÄTEPAIKKA SUOMEKSI'
                        disabled={isEditingDisabled}
                        value={routePath.destinationFi}
                        onChange={this.onChange('destinationFi')}
                        validatorRule={routePathValidationModel.destination}
                    />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='LÄHTÖPAIKKA RUOTSIKSI'
                        disabled={isEditingDisabled}
                        value={routePath.originSw}
                        onChange={this.onChange('originSw')}
                        validatorRule={routePathValidationModel.origin}
                    />
                    <InputContainer
                        label='PÄÄTEPAIKKA RUOTSIKSI'
                        disabled={isEditingDisabled}
                        value={routePath.destinationSw}
                        onChange={this.onChange('destinationSw')}
                        validatorRule={routePathValidationModel.destination}
                    />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='LYHENNE SUOMEKSI'
                        disabled={isEditingDisabled}
                        value={routePath.routePathShortName}
                        onChange={this.onChange('routePathShortName')}
                        validatorRule={routePathValidationModel.shortName}
                    />
                    <InputContainer
                        label='LYHENNE RUOTSIKSI'
                        disabled={isEditingDisabled}
                        value={routePath.routePathShortNameSw}
                        onChange={this.onChange('routePathShortNameSw')}
                        validatorRule={routePathValidationModel.shortName}
                    />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='VOIM. AST'
                        type='date'
                        value={routePath.startTime}
                        onChange={this.onChange('startTime')}
                        disabled={disabledIfUpdating}
                        validatorRule={routePathValidationModel.date}
                    />
                    <InputContainer
                        label='VIIM.VOIM.OLO'
                        type='date'
                        value={routePath.endTime}
                        onChange={this.onChange('endTime')}
                        disabled={this.props.isEditingDisabled}
                        validatorRule={routePathValidationModel.date}
                    />
                    <InputContainer
                        label={this.renderLengthLabel()}
                        value={routePath.length}
                        disabled={isEditingDisabled}
                        validatorRule={routePathValidationModel.length}
                        type='number'
                        onChange={this.onChange('length')}
                    />
                    <TextContainer
                        label='Laskettu'
                        value={this.props.routePathStore!.getCalculatedLength()}
                    />
                </div>
                <div className={s.flexRow}>
                    <Dropdown
                        label='SUUNTA'
                        disabled={disabledIfUpdating}
                        onChange={this.onChange('direction')}
                        codeList={directionCodeList}
                        selected={this.props.routePath.direction}
                    />
                    <Dropdown
                        label='POIKKEUSREITTI'
                        disabled={isEditingDisabled}
                        selected={this.props.routePath.exceptionPath}
                        onChange={this.onChange('exceptionPath')}
                        codeList={booleanCodeList}
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
                <div className={s.formItem}>
                    KARTTA
                </div>
                <div className={s.formItem}>
                    Esitettävien ajoaikojen kausi ja aikajakso
                    (Toteutus / suunnittelu kesken)
                    <div className={s.flexInnerRow}>
                        {/* TODO */}
                        <Dropdown
                            onChange={this.onChange}
                            disabled={isEditingDisabled}
                            codeList={directionCodeList}
                            selected='Suunta 1'
                        />
                        {/* TODO */}
                        <Dropdown
                            onChange={this.onChange}
                            disabled={isEditingDisabled}
                            codeList={directionCodeList}
                            selected='Suunta 2'
                        />
                    </div>
                </div>
            </div>
            <div className={s.formSection}>
                <LinkListView
                    routePath={this.props.routePath}
                />
            </div>
        </div>
        );
    }
}
export default RoutePathForm;
