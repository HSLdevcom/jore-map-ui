import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { FiInfo } from 'react-icons/fi';
import { IoIosAddCircleOutline } from 'react-icons/io';
import { match } from 'react-router';
import { Button, Dropdown } from '~/components/controls';
import { IDropdownItem } from '~/components/controls/Dropdown';
import InputContainer from '~/components/controls/InputContainer';
import ButtonType from '~/enums/buttonType';
import { INode, IStop } from '~/models';
import IHastusArea from '~/models/IHastusArea';
import IStopArea from '~/models/IStopArea';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import RouteBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import { IStopSectionItem } from '~/services/stopService';
import { CodeListStore } from '~/stores/codeListStore';
import { ModalStore } from '~/stores/modalStore';
import { NodeStore } from '~/stores/nodeStore';
import SidebarHeader from '../SidebarHeader';
import ShortIdInput from './ShortIdInput';
import HastusAreaModal from './hastusAreaModal';
import * as s from './stopForm.scss';

interface IStopFormProps {
    node: INode;
    isNewStop: boolean;
    isEditingDisabled: boolean;
    stopAreas: IStopArea[];
    stopSections: IStopSectionItem[];
    hastusAreas: IHastusArea[];
    stopInvalidPropertiesMap: object;
    nodeInvalidPropertiesMap: object;
    saveHastusArea?: ({ isNewHastusArea }: { isNewHastusArea: boolean }) => void;
    match?: match<any>;
    isReadOnly?: boolean;
    updateStopProperty?: (property: keyof IStop) => (value: any) => void;
    onNodePropertyChange?: (property: keyof INode) => (value: any) => void;
    setCurrentStateIntoNodeCache?: () => void;
    codeListStore?: CodeListStore;
    nodeStore?: NodeStore;
    modalStore?: ModalStore;
}

// Key: node id beginning, value: short id options array
const SHORT_ID_OPTIONS_MAP = {
    1: ['H', 'XH'],
    2: ['E', 'XE'],
    3: ['Ka'],
    4: ['V', 'XV'],
    5: ['Hy', 'La', 'Ri', 'Vi', 'Ko', 'Or'],
    6: ['Ki', 'Ra'],
    90: ['Ke'],
    91: ['Ke'],
    92: ['Si'],
    93: ['Po'],
    94: ['Pn'],
    95: ['Jä'],
    96: ['Tu'],
    97: ['Nu'],
    98: ['Mä'],
};

@inject('codeListStore', 'nodeStore', 'modalStore')
@observer
class StopForm extends Component<IStopFormProps> {
    private createStopAreaDropdownItems = (stopAreas: IStopArea[]): IDropdownItem[] => {
        return stopAreas.map((stopArea: IStopArea) => {
            const item: IDropdownItem = {
                value: `${stopArea.id}`,
                label: `${stopArea.id} - ${stopArea.nameFi}`,
            };
            return item;
        });
    };

    private getShortIdLetterDropdownItems = (nodeId: string) => {
        const dropdownItems: IDropdownItem[] = [];
        for (const nodeIdBeginning in SHORT_ID_OPTIONS_MAP) {
            if (Object.prototype.hasOwnProperty.call(SHORT_ID_OPTIONS_MAP, nodeIdBeginning)) {
                if (nodeId.startsWith(nodeIdBeginning)) {
                    const nodeIdOptions = SHORT_ID_OPTIONS_MAP[nodeIdBeginning];
                    nodeIdOptions.forEach((nodeIdOption: string) => {
                        const codeListLabel = this.props.codeListStore!.getCodeListLabel(
                            'Lyhyttunnus',
                            nodeIdOption
                        );
                        const dropdownItem = {
                            value: nodeIdOption,
                            label: `${nodeIdOption} - ${codeListLabel}`,
                        };
                        dropdownItems.push(dropdownItem);
                    });
                }
            }
        }
        return dropdownItems;
    };

    private onShortIdLetterChange = (value: string) => {
        this.props.onNodePropertyChange!('shortIdLetter')(value);
        if (!value) {
            this.props.onNodePropertyChange!('shortIdString')(null);
        }
    };

    private redirectToStopArea = (stopAreaId: string | undefined) => {
        this.props.setCurrentStateIntoNodeCache!();
        const routePathViewLink = RouteBuilder.to(SubSites.stopArea)
            .toTarget(':id', stopAreaId!)
            .toLink();
        navigator.goTo({ link: routePathViewLink, shouldSkipUnsavedChangesPrompt: true });
    };

    private redirectToNewStopArea = () => {
        this.props.setCurrentStateIntoNodeCache!();
        const node = this.props.node;
        let link;
        if (this.props.isNewStop) {
            link = RouteBuilder.to(SubSites.newStopArea)
                .append(
                    QueryParams.latLng,
                    `${node.coordinatesProjection.lat}:${node.coordinatesProjection.lng}`
                )
                .toLink();
        } else {
            link = RouteBuilder.to(SubSites.newStopArea)
                .append(QueryParams.nodeId, node.id)
                .toLink();
        }

        navigator.goTo({ link, shouldSkipUnsavedChangesPrompt: true });
    };

    private openCreateHastusAreaModal = () => {
        this.props.nodeStore!.setHastusArea({
            id: '',
            name: '',
        });
        this.props.nodeStore!.setOldHastusArea(null);
        this.props.modalStore!.openModal({
            content: (
                <HastusAreaModal
                    isNewHastusArea={true}
                    existingHastusAreas={this.props.hastusAreas}
                    saveHastusArea={this.props.saveHastusArea!}
                />
            ),
        });
    };

    private openEditHastusAreaModal = () => {
        const currentHastusArea = this.props.hastusAreas.find(
            (hastusArea) => hastusArea.id === this.props.node!.stop!.hastusId
        );
        this.props.nodeStore!.setHastusArea(currentHastusArea!);
        this.props.nodeStore!.setOldHastusArea(currentHastusArea!);
        this.props.modalStore!.openModal({
            content: (
                <HastusAreaModal
                    isNewHastusArea={false}
                    existingHastusAreas={this.props.hastusAreas.filter(
                        (hastusArea) => hastusArea.id !== currentHastusArea!.id
                    )}
                    saveHastusArea={this.props.saveHastusArea!}
                />
            ),
        });
    };

    private createStopSectionDropdownItems = (
        stopSections: IStopSectionItem[]
    ): IDropdownItem[] => {
        return stopSections.map((stopSection: IStopSectionItem) => {
            const item: IDropdownItem = {
                value: `${stopSection.selite}`,
                label: `${stopSection.selite}`,
            };
            return item;
        });
    };

    private createHastusAreaDropdownItems = (hastusAreas: IHastusArea[]): IDropdownItem[] => {
        return hastusAreas.map((hastusArea: IHastusArea) => {
            const item: IDropdownItem = {
                value: `${hastusArea.id}`,
                label: `${hastusArea.id} - ${hastusArea.name}`,
            };
            return item;
        });
    };

    private getTariffiDropdownOptions = () => {
        const originalDropdownItemList = this.props.codeListStore!.getDropdownItemList(
            'Tariffialue'
        );
        return originalDropdownItemList.filter((dropdownItem) => {
            // filter out unwanted values 00 - TYHJÄ and 99 - EI HSL
            return !(dropdownItem.value === '00' || dropdownItem.value === '99');
        });
    };

    render() {
        const {
            node,
            isEditingDisabled,
            stopAreas,
            stopSections,
            hastusAreas,
            stopInvalidPropertiesMap,
            nodeInvalidPropertiesMap,
            onNodePropertyChange,
            updateStopProperty,
            isReadOnly,
        } = this.props;
        const stop = node.stop!;
        const currentHastusArea = hastusAreas.find(
            (hastusArea) => hastusArea.id === this.props.node!.stop!.hastusId
        );
        return (
            <div className={classnames(s.stopView, s.form)}>
                <SidebarHeader>Pysäkin tiedot</SidebarHeader>
                <div className={s.formSection}>
                    <div className={s.flexRow}>
                        <Dropdown
                            label='LYHYTTUNNUS (2 kirj.'
                            onChange={this.onShortIdLetterChange}
                            disabled={isEditingDisabled}
                            selected={node.shortIdLetter}
                            emptyItem={{
                                value: '',
                                label: '',
                            }}
                            items={this.getShortIdLetterDropdownItems(node.id)}
                        />
                        <ShortIdInput
                            node={node}
                            isBackgroundGrey={!isEditingDisabled && !Boolean(node.shortIdLetter)}
                            isEditingDisabled={isEditingDisabled || !Boolean(node.shortIdLetter)}
                            nodeInvalidPropertiesMap={nodeInvalidPropertiesMap}
                            onNodePropertyChange={onNodePropertyChange}
                        />
                    </div>
                </div>
                <div className={s.formSection}>
                    <div className={s.sectionHeader}>Nimitiedot</div>
                    <div className={s.flexRow}>
                        <InputContainer
                            label='NIMI'
                            disabled={true}
                            value={stop.nameFi}
                            onChange={updateStopProperty!('nameFi')}
                            validationResult={stopInvalidPropertiesMap['nameFi']}
                        />
                        <InputContainer
                            label='NIMI RUOTSIKSI'
                            disabled={true}
                            value={stop.nameSw}
                            onChange={updateStopProperty!('nameSw')}
                            validationResult={stopInvalidPropertiesMap['nameSw']}
                        />
                    </div>
                    <div className={s.flexRow}>
                        <Dropdown
                            onChange={updateStopProperty!('stopAreaId')}
                            items={this.createStopAreaDropdownItems(stopAreas)}
                            selected={stop.stopAreaId}
                            emptyItem={{
                                value: '',
                                label: '',
                            }}
                            disabled={isEditingDisabled}
                            label='PYSÄKKIALUE'
                            validationResult={stopInvalidPropertiesMap['stopAreaId']}
                            data-cy='stopArea'
                        />
                        {!isReadOnly && (
                            <>
                                <Button
                                    className={classnames(
                                        s.dropdownButton,
                                        !stop.stopAreaId ? s.dropdownButtonCentered : undefined
                                    )}
                                    hasReverseColor={true}
                                    onClick={() => {
                                        this.redirectToStopArea(stop.stopAreaId);
                                    }}
                                    disabled={!Boolean(stop.stopAreaId)}
                                >
                                    <FiInfo />
                                </Button>
                                <Button
                                    className={classnames(
                                        s.dropdownButton,
                                        !stop.stopAreaId ? s.dropdownButtonCentered : undefined
                                    )}
                                    hasReverseColor={true}
                                    onClick={() => this.redirectToNewStopArea()}
                                    type={ButtonType.SQUARE}
                                >
                                    <IoIosAddCircleOutline />
                                </Button>
                            </>
                        )}
                    </div>
                    <div className={s.flexRow}>
                        <InputContainer
                            label='PITKÄ NIMI'
                            disabled={isEditingDisabled}
                            value={stop.nameLongFi}
                            onChange={updateStopProperty!('nameLongFi')}
                            validationResult={stopInvalidPropertiesMap['nameLongFi']}
                            data-cy='longNameInput'
                        />
                        <InputContainer
                            label='PITKÄ NIMI RUOTSIKSI'
                            disabled={isEditingDisabled}
                            value={stop.nameLongSw}
                            onChange={updateStopProperty!('nameLongSw')}
                            validationResult={stopInvalidPropertiesMap['nameLongSw']}
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
                            onChange={updateStopProperty!('placeNameFi')}
                            validationResult={stopInvalidPropertiesMap['placeNameFi']}
                        />
                        <InputContainer
                            label='PAIKAN NIMI RUOTSIKSI'
                            disabled={isEditingDisabled}
                            value={stop.placeNameSw}
                            onChange={updateStopProperty!('placeNameSw')}
                            validationResult={stopInvalidPropertiesMap['placeNameSw']}
                        />
                    </div>
                    <div className={s.flexRow}>
                        <InputContainer
                            label='OSOITE'
                            disabled={isEditingDisabled}
                            value={stop.addressFi}
                            onChange={updateStopProperty!('addressFi')}
                            validationResult={stopInvalidPropertiesMap['addressFi']}
                            data-cy='addressFi'
                        />
                        <InputContainer
                            label='OSOITE RUOTSIKSI'
                            disabled={isEditingDisabled}
                            value={stop.addressSw}
                            onChange={updateStopProperty!('addressSw')}
                            validationResult={stopInvalidPropertiesMap['addressSw']}
                            data-cy='addressSw'
                        />
                    </div>
                    <div className={s.flexRow}>
                        <InputContainer
                            label='POSTINUMERO'
                            disabled={isEditingDisabled}
                            value={stop.postalNumber}
                            onChange={updateStopProperty!('postalNumber')}
                            validationResult={stopInvalidPropertiesMap['postalNumber']}
                        />
                        <Dropdown
                            onChange={updateStopProperty!('municipality')}
                            items={this.props.codeListStore!.getDropdownItemList('Kunta (KELA)')}
                            selected={stop.municipality}
                            disabled={isEditingDisabled}
                            label='KUNTA'
                            validationResult={stopInvalidPropertiesMap['municipality']}
                            data-cy='municipality'
                        />
                    </div>
                    <div className={s.messageContainer}>
                        Jos osoitetiedot eivät päivity automaattisesti, voit hakea oikeat tiedot
                        esim. täältä:{' '}
                        <a href='https://kartta.hsy.fi/' target='blank_'>
                            https://kartta.hsy.fi/
                        </a>
                    </div>
                </div>
                <div className={s.formSection}>
                    <div className={s.sectionHeader}>Muut tiedot</div>
                    <div className={s.flexRow}>
                        <Dropdown
                            onChange={updateStopProperty!('section')}
                            items={this.createStopSectionDropdownItems(stopSections)}
                            selected={stop.section}
                            emptyItem={{
                                value: '',
                                label: '',
                            }}
                            disabled={isEditingDisabled}
                            label='VYÖHYKE'
                            validationResult={stopInvalidPropertiesMap['section']}
                            data-cy='section'
                        />
                        <Dropdown
                            onChange={updateStopProperty!('roof')}
                            items={this.props.codeListStore!.getDropdownItemList('Pysäkkityyppi')}
                            selected={stop.roof}
                            disabled={isEditingDisabled}
                            label='PYSÄKKIKATOS'
                            validationResult={stopInvalidPropertiesMap['roof']}
                            data-cy='roof'
                        />
                    </div>
                    <div className={s.flexRow}>
                        <InputContainer
                            label='ELYNUMERO'
                            disabled={isEditingDisabled}
                            value={stop.elyNumber}
                            validationResult={stopInvalidPropertiesMap['elyNumber']}
                            onChange={updateStopProperty!('elyNumber')}
                            data-cy='elyNumber'
                        />
                        <Dropdown
                            onChange={updateStopProperty!('tariffi')}
                            items={this.getTariffiDropdownOptions()}
                            selected={stop.tariffi}
                            disabled={isEditingDisabled}
                            label='TARIFFI'
                            validationResult={stopInvalidPropertiesMap['tariffi']}
                            data-cy='tariffi'
                        />
                    </div>
                    <div className={s.flexRow}>
                        <InputContainer
                            label='LAITURI'
                            disabled={isEditingDisabled}
                            value={stop.platform}
                            onChange={updateStopProperty!('platform')}
                            validationResult={stopInvalidPropertiesMap['platform']}
                        />
                        <InputContainer
                            label='SÄDE (m)'
                            disabled={isEditingDisabled}
                            value={stop.radius}
                            type='number'
                            onChange={updateStopProperty!('radius')}
                            validationResult={stopInvalidPropertiesMap['radius']}
                        />
                    </div>
                    <div className={s.flexRow}>
                        <Dropdown
                            onChange={updateStopProperty!('hastusId')}
                            items={this.createHastusAreaDropdownItems(hastusAreas)}
                            selected={stop.hastusId}
                            emptyItem={{
                                value: '',
                                label: '',
                            }}
                            disabled={isEditingDisabled}
                            label='HASTUS-PAIKKA'
                            validationResult={stopInvalidPropertiesMap['hastusId']}
                        />
                        {!isReadOnly && (
                            <>
                                <Button
                                    className={s.dropdownButton}
                                    onClick={this.openEditHastusAreaModal}
                                    type={ButtonType.SQUARE}
                                    disabled={!Boolean(currentHastusArea)}
                                    hasReverseColor={true}
                                    data-cy='editHastusButton'
                                >
                                    <FiInfo />
                                </Button>
                                <Button
                                    className={s.dropdownButton}
                                    onClick={this.openCreateHastusAreaModal}
                                    type={ButtonType.SQUARE}
                                    hasReverseColor={true}
                                    data-cy='createHastusButton'
                                >
                                    <IoIosAddCircleOutline />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default StopForm;
