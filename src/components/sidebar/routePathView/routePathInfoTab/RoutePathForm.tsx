import React from 'react';
import { observer, inject } from 'mobx-react';
import { FiRefreshCw } from 'react-icons/fi';
import classnames from 'classnames';
import { IRoutePath } from '~/models';
import { RoutePathStore } from '~/stores/routePathStore';
import { CodeListStore } from '~/stores/codeListStore';
import routeBuilder from '~/routing/routeBuilder';
import routePathValidationModel from '~/models/validationModels/routePathValidationModel';
import SubSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import InputContainer from '../../InputContainer';
import TextContainer from '../../TextContainer';
import LinkListView from './LinkListView';
import { Button, Dropdown } from '../../../controls';
import ButtonType from '../../../../enums/buttonType';
import * as s from './routePathForm.scss';

interface IRoutePathFormProps {
    routePathStore?: RoutePathStore;
    codeListStore?: CodeListStore;
    isEditingDisabled: boolean;
    routePath: IRoutePath;
    isNewRoutePath: boolean;
    onChange: (property: string) => (value: any) => void;
    invalidPropertiesMap: object;
}

@inject('routePathStore', 'codeListStore')
@observer
class RoutePathForm extends React.Component<IRoutePathFormProps> {
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

    private showAlertPlanningInProgress = () => {
        window.alert('Toteutuksen suunnittelu kesken.');
    };

    private updateLength = () => {
        this.props.routePathStore!.updateRoutePathProperty(
            'length',
            this.props.routePathStore!.getCalculatedLength()
        );
    };

    private renderLengthLabel = () => {
        const isEditingDisabled = this.props.isEditingDisabled;

        return (
            <>
                PITUUS
                <div
                    className={classnames(
                        s.lengthIcon,
                        isEditingDisabled ? s.disabled : ''
                    )}
                    onClick={this.updateLength}
                >
                    <FiRefreshCw />
                </div>
            </>
        );
    };

    render() {
        const isEditingDisabled = this.props.isEditingDisabled;
        const isUpdating =
            !this.props.isNewRoutePath || this.props.isEditingDisabled;
        const invalidPropertiesMap = this.props.invalidPropertiesMap;
        const onChange = this.props.onChange;

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
                            onChange={onChange('originFi')}
                            validationResult={invalidPropertiesMap['originFi']}
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
                            validationResult={invalidPropertiesMap['originSw']}
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
                            onChange={onChange('startTime')}
                            validationResult={invalidPropertiesMap['startTime']}
                        />
                        <InputContainer
                            label='VIIM.VOIM.OLO'
                            disabled={this.props.isEditingDisabled}
                            type='date'
                            value={routePath.endTime}
                            onChange={onChange('endTime')}
                            validationResult={invalidPropertiesMap['endTime']}
                        />
                        <InputContainer
                            label={this.renderLengthLabel()}
                            value={routePath.length}
                            disabled={isEditingDisabled}
                            validatorRule={routePathValidationModel.length}
                            type='number'
                            onChange={onChange('length')}
                            validationResult={invalidPropertiesMap['length']}
                        />
                        <TextContainer
                            label='Laskettu'
                            value={this.props.routePathStore!.getCalculatedLength()}
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
                            onChange={onChange('direction')}
                            validationResult={invalidPropertiesMap['direction']}
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
                        Esitettävien ajoaikojen kausi ja aikajakso (Toteutus /
                        suunnittelu kesken)
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
        );
    }
}
export default RoutePathForm;
