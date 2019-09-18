import React from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import InputContainer from '~/components/controls/InputContainer';
import TextContainer from '~/components/controls/TextContainer';
import { IStop, INode } from '~/models';
import ButtonType from '~/enums/buttonType';
import { NodeStore } from '~/stores/nodeStore';
import { CodeListStore } from '~/stores/codeListStore';
import StopService, {
    IStopAreaItem,
    IStopSectionItem
} from '~/services/stopService';
import stopValidationModel from '~/models/validationModels/stopValidationModel';
import { IDropdownItem } from '~/components/controls/Dropdown';
import ViewFormBase from '~/components/shared/inheritedComponents/ViewFormBase';
import {
    Dropdown,
    TransitToggleButtonBar,
    Button
} from '~/components/controls';
import SidebarHeader from '../SidebarHeader';
import * as s from './stopForm.scss';

interface IStopFormProps {
    node: INode;
    isNewStop: boolean;
    isEditingDisabled: boolean;
    nodeStore?: NodeStore;
    codeListStore?: CodeListStore;
    nodeInvalidPropertiesMap: object;
    onNodePropertyChange: (property: keyof INode) => (value: any) => void;
}

interface IStopFormState {
    isLoading: boolean; // not currently in use, declared because ViewFormBase needs this
    invalidPropertiesMap: object;
    isEditingDisabled: boolean; // not currently in use, declared because ViewFormBase needs this
    stopAreas: IDropdownItem[];
    stopSections: IDropdownItem[];
}

@inject('nodeStore', 'codeListStore')
@observer
class StopForm extends ViewFormBase<IStopFormProps, IStopFormState> {
    private mounted: boolean;

    constructor(props: IStopFormProps) {
        super(props);
        this.state = {
            isLoading: false,
            invalidPropertiesMap: {},
            isEditingDisabled: false,
            stopAreas: [],
            stopSections: []
        };
    }

    async componentWillMount() {
        const stopAreas: IStopAreaItem[] = await StopService.fetchAllStopAreas();
        const stopSections: IStopSectionItem[] = await StopService.fetchAllStopSections();
        if (this.mounted) {
            this.setState({
                stopAreas: this.createStopAreaDropdownItems(stopAreas),
                stopSections: this.createStopSectionDropdownItems(stopSections)
            });
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentDidMount() {
        this.mounted = true;
        this.validateStop();
    }

    componentDidUpdate(prevProps: IStopFormProps) {
        if (prevProps.node.stop!.nodeId !== this.props.node.stop!.nodeId) {
            this.validateStop();
        }
        if (
            prevProps.isEditingDisabled !== this.props.isEditingDisabled &&
            !this.props.isEditingDisabled
        ) {
            this.validateStop();
        }
    }

    private createStopAreaDropdownItems = (
        stopAreas: IStopAreaItem[]
    ): IDropdownItem[] => {
        return stopAreas.map((stopArea: IStopAreaItem) => {
            const item: IDropdownItem = {
                value: `${stopArea.pysalueid}`,
                label: `${stopArea.pysalueid} - ${stopArea.nimi}`
            };
            return item;
        });
    };

    private createStopSectionDropdownItems = (
        stopSections: IStopSectionItem[]
    ): IDropdownItem[] => {
        return stopSections.map((stopSection: IStopSectionItem) => {
            const item: IDropdownItem = {
                value: `${stopSection.selite}`,
                label: `${stopSection.selite}`
            };
            return item;
        });
    };

    private validateStop = () => {
        const node = this.props.nodeStore!.node;
        if (!node) return;
        const stop = node.stop;
        this.validateAllProperties(stopValidationModel, stop);
        const isStopFormValid = this.isFormValid();
        this.props.nodeStore!.setIsStopFormValid(isStopFormValid);
    };

    private onChangeStopProperty = (property: keyof IStop) => (value: any) => {
        this.props.nodeStore!.updateStop(property, value);
        this.validateProperty(stopValidationModel[property], property, value);
        const isStopFormValid = this.isFormValid();
        this.props.nodeStore!.setIsStopFormValid(isStopFormValid);
    };

    private getShortIdLetterItems = () => {
        const shortIdLetterItems = this.props.codeListStore!.getDropdownItemList(
            'Lyhyttunnus'
        );
        shortIdLetterItems.forEach(
            item => (item.label = `${item.value} - ${item.label}`)
        );
        return shortIdLetterItems;
    };

    render() {
        const isEditingDisabled = this.props.isEditingDisabled;
        const node = this.props.node;
        const stop = node.stop!;
        const onChange = this.onChangeStopProperty;
        const invalidPropertiesMap = this.state.invalidPropertiesMap;
        return (
            <div className={classnames(s.stopView, s.form)}>
                <SidebarHeader hideCloseButton={true}>
                    Pysäkin tiedot
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
                                    toggleSelectedTransitType={this.onChangeStopProperty(
                                        'transitType'
                                    )}
                                />
                            </div>
                        </div>
                    )}
                    <div className={s.flexRow}>
                        <Dropdown
                            label='LYHYTTUNNUS (2 kirj.'
                            onChange={this.props.onNodePropertyChange(
                                'shortIdLetter'
                            )}
                            disabled={isEditingDisabled}
                            selected={node.shortIdLetter}
                            emptyItem={{
                                value: '',
                                label: ''
                            }}
                            items={this.getShortIdLetterItems()}
                        />
                        <InputContainer
                            label='+ 4 num.)'
                            disabled={isEditingDisabled}
                            value={node.shortIdString}
                            onChange={this.props.onNodePropertyChange(
                                'shortIdString'
                            )}
                            validationResult={
                                this.props.nodeInvalidPropertiesMap[
                                    'shortIdString'
                                ]
                            }
                        />
                    </div>
                </div>
                <div className={s.formSection}>
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
                            value={stop.nameSw}
                            onChange={onChange('nameSw')}
                            validationResult={invalidPropertiesMap['nameSw']}
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
                            value={stop.nameLongSw}
                            onChange={onChange('nameLongSw')}
                            validationResult={
                                invalidPropertiesMap['nameLongSw']
                            }
                        />
                    </div>
                    <div className={s.flexRow}>
                        <TextContainer
                            label='PITKÄ NIMI MUOKATTU PVM'
                            value={stop.nameModifiedOn}
                            isTimeIncluded={true}
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
                            value={stop.placeNameSw}
                            onChange={onChange('placeNameSw')}
                            validationResult={
                                invalidPropertiesMap['placeNameSw']
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
                            value={stop.addressSw}
                            onChange={onChange('addressSw')}
                            validationResult={invalidPropertiesMap['addressSw']}
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
                            items={this.props.codeListStore!.getDropdownItemList(
                                'Kunta (ris/pys)'
                            )}
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
                        <Dropdown
                            onChange={onChange('section')}
                            items={this.state.stopSections}
                            selected={stop.section}
                            emptyItem={{
                                value: '',
                                label: ''
                            }}
                            disabled={isEditingDisabled}
                            label='VYÖHYKE'
                            validationResult={invalidPropertiesMap['section']}
                        />
                        <InputContainer
                            label='HASTUS-PAIKKA'
                            disabled={isEditingDisabled}
                            value={stop.hastusId}
                            validationResult={invalidPropertiesMap['hastusId']}
                            onChange={onChange('hastusId')}
                        />
                    </div>
                    <div className={s.flexRow}>
                        <Dropdown
                            onChange={onChange('areaId')}
                            items={this.state.stopAreas}
                            selected={stop.areaId}
                            emptyItem={{
                                value: '',
                                label: ''
                            }}
                            disabled={isEditingDisabled}
                            label='PYSÄKKIALUE'
                            validationResult={invalidPropertiesMap['areaId']}
                        />
                        <Button
                            // TODO: implement the button functionality
                            onClick={() =>
                                window.alert('Toteutuksen suunnittelu kesken.')
                            }
                            disabled={isEditingDisabled}
                            type={ButtonType.SQUARE}
                            className={s.createNewStopAreaButton}
                        >
                            Luo uusi pysäkkialue
                        </Button>
                    </div>
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
