import React from 'react';
import { inject, observer } from 'mobx-react';
import InputContainer from '~/components/sidebar/InputContainer';
import { IStop } from '~/models';
import { NodeStore } from '~/stores/nodeStore';
import { codeListName } from '~/stores/codeListStore';
import ICodeListItem from '~/models/ICodeListItem';
import stopValidationModel from '~/models/validationModels/stopValidationModel';
import ViewFormBase from '~/components/shared/inheritedComponents/ViewFormBase';
import { Dropdown, TransitToggleButtonBar } from '~/components/controls';
import SidebarHeader from '../SidebarHeader';
import * as s from './stopForm.scss';

interface IStopFormProps {
    stop: IStop;
    isNewStop: boolean;
    isEditingDisabled: boolean;
    invalidPropertiesMap: object;
    nodeStore?: NodeStore;
    getDropDownItems: (codeListIdentifier: codeListName) => ICodeListItem[];
}

interface IStopFormState {
    isLoading: boolean; // not currently in use, declared because ViewFormBase needs this
    invalidPropertiesMap: object;
    isEditingDisabled: boolean; // not currently in use, declared because ViewFormBase needs this
}

@inject('nodeStore')
@observer
class StopForm extends ViewFormBase<IStopFormProps, IStopFormState> {
    constructor(props: IStopFormProps) {
        super(props);
        this.state = {
            isLoading: false,
            invalidPropertiesMap: {},
            isEditingDisabled: false
        };
    }

    componentDidMount() {
        this.validateStop();
    }

    componentDidUpdate(prevProps: IStopFormProps) {
        if (prevProps.stop.nodeId !== this.props.stop.nodeId) {
            this.validateStop();
        }
        if (
            prevProps.isEditingDisabled !== this.props.isEditingDisabled &&
            !this.props.isEditingDisabled
        ) {
            this.validateStop();
        }
    }

    private validateStop = () => {
        const node = this.props.nodeStore!.node;
        if (!node) return;
        const stop = node.stop;
        this.validateAllProperties(stopValidationModel, stop);
        const isStopFormValid = this.isFormValid();
        this.props.nodeStore!.setIsStopFormValid(isStopFormValid);
    };

    private onStopPropertyChange = (property: keyof IStop) => (value: any) => {
        this.props.nodeStore!.updateStop(property, value);
        this.validateProperty(stopValidationModel[property], property, value);
        const isStopFormValid = this.isFormValid();
        this.props.nodeStore!.setIsStopFormValid(isStopFormValid);
    };

    render() {
        const isEditingDisabled = this.props.isEditingDisabled;
        const stop = this.props.stop;
        const onChange = this.onStopPropertyChange;
        const invalidPropertiesMap = this.state.invalidPropertiesMap;
        const getDropDownItems = this.props.getDropDownItems;

        return (
            <div className={s.stopView}>
                <SidebarHeader hideCloseButton={true}>
                    Pysäkkitiedot
                </SidebarHeader>
                <div className={s.formSection}>
                    {this.props.isNewStop && (
                        <div className={s.flexRow}>
                            <div className={s.formItem}>
                                <div className={s.inputLabel}>VERKKO</div>
                                <TransitToggleButtonBar
                                    selectedTransitTypes={
                                        stop.transitType
                                            ? [stop.transitType]
                                            : []
                                    }
                                    toggleSelectedTransitType={this.onStopPropertyChange(
                                        'transitType'
                                    )}
                                />
                            </div>
                        </div>
                    )}
                    <div className={s.sectionHeader}>Nimitiedot</div>
                    <div className={s.flexRow}>
                        <InputContainer
                            label='NIMI'
                            disabled={isEditingDisabled}
                            value={stop.nameFi}
                            onChange={onChange('nameFi')}
                            validationResult={invalidPropertiesMap['nameFi']}
                        />
                        <InputContainer
                            label='NIMI RUOTSIKSI'
                            disabled={isEditingDisabled}
                            value={stop.nameSe}
                            onChange={onChange('nameSe')}
                            validationResult={invalidPropertiesMap['nameSe']}
                        />
                    </div>
                    <div className={s.flexRow}>
                        <InputContainer
                            label='PITKÄ NIMI'
                            disabled={isEditingDisabled}
                            value={stop.nameLongFi}
                            onChange={onChange('nameLongFi')}
                            validationResult={
                                invalidPropertiesMap['nameLongFi']
                            }
                        />
                        <InputContainer
                            label='PITKÄ NIMI RUOTSIKSI'
                            disabled={isEditingDisabled}
                            value={stop.nameLongSe}
                            onChange={onChange('nameLongSe')}
                            validationResult={
                                invalidPropertiesMap['nameLongSe']
                            }
                        />
                    </div>
                </div>
                <div className={s.formSection}>
                    <div className={s.sectionHeader}>Osoitetiedot</div>
                    <div className={s.flexRow}>
                        <InputContainer
                            label='PAIKAN NIMI'
                            disabled={isEditingDisabled}
                            value={stop.placeNameFi}
                            onChange={onChange('placeNameFi')}
                            validationResult={
                                invalidPropertiesMap['placeNameFi']
                            }
                        />
                        <InputContainer
                            label='PAIKAN NIMI RUOTSIKSI'
                            disabled={isEditingDisabled}
                            value={stop.placeNameSe}
                            onChange={onChange('placeNameSe')}
                            validationResult={
                                invalidPropertiesMap['placeNameSe']
                            }
                        />
                    </div>
                    <div className={s.flexRow}>
                        <InputContainer
                            label='OSOITE'
                            disabled={isEditingDisabled}
                            value={stop.addressFi}
                            onChange={onChange('addressFi')}
                            validationResult={invalidPropertiesMap['addressFi']}
                        />
                        <InputContainer
                            label='OSOITE RUOTSIKSI'
                            disabled={isEditingDisabled}
                            value={stop.addressSe}
                            onChange={onChange('addressSe')}
                            validationResult={invalidPropertiesMap['addressSe']}
                        />
                    </div>
                    <div className={s.flexRow}>
                        <InputContainer
                            label='POSTINUMERO'
                            disabled={isEditingDisabled}
                            value={stop.postalNumber}
                            onChange={onChange('postalNumber')}
                            validationResult={
                                invalidPropertiesMap['postalNumber']
                            }
                        />
                        <Dropdown
                            onChange={onChange('municipality')}
                            items={getDropDownItems('Kunta (ris/pys)')}
                            selected={stop.municipality}
                            disabled={isEditingDisabled}
                            label='KUNTA'
                            validationResult={
                                invalidPropertiesMap['municipality']
                            }
                        />
                    </div>
                </div>
                <div className={s.formSection}>
                    <div className={s.sectionHeader}>Muu tiedot</div>
                    <div className={s.flexRow}>
                        <InputContainer
                            label='LAITURI'
                            disabled={isEditingDisabled}
                            value={stop.platform}
                            onChange={onChange('platform')}
                            validationResult={invalidPropertiesMap['platform']}
                        />
                        <InputContainer
                            label='SÄDE (m)'
                            disabled={isEditingDisabled}
                            value={stop.radius}
                            type='number'
                            onChange={onChange('radius')}
                            validationResult={invalidPropertiesMap['radius']}
                        />
                    </div>
                    <div className={s.flexRow}>
                        <InputContainer
                            label='VYÖHYKE'
                            disabled={isEditingDisabled}
                            value={stop.section}
                            onChange={onChange('section')}
                            validationResult={invalidPropertiesMap['section']}
                        />
                        <InputContainer
                            label='HASTUSPAIKKA'
                            disabled={isEditingDisabled}
                            value={stop.hastusId}
                            validationResult={invalidPropertiesMap['hastusId']}
                            onChange={onChange('hastusId')}
                        />
                    </div>
                    <div className={s.flexRow}>
                        <InputContainer
                            label='PYSÄKKIALUE'
                            disabled={isEditingDisabled}
                            value={stop.areaId}
                            validationResult={invalidPropertiesMap['areaId']}
                            onChange={onChange('areaId')}
                        />
                        <InputContainer
                            label='ELYNUMERO'
                            disabled={isEditingDisabled}
                            value={stop.elyNumber}
                            validationResult={invalidPropertiesMap['elyNumber']}
                            onChange={onChange('elyNumber')}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default StopForm;
