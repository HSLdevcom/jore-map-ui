import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { FiInfo } from 'react-icons/fi';
import { IoIosAddCircleOutline } from 'react-icons/io';
import { match } from 'react-router';
import { Button, Dropdown, TransitToggleButtonBar } from '~/components/controls';
import { IDropdownItem } from '~/components/controls/Dropdown';
import InputContainer from '~/components/controls/InputContainer';
import ButtonType from '~/enums/buttonType';
import TransitType from '~/enums/transitType';
import { INode, IStop } from '~/models';
import IHastusArea from '~/models/IHastusArea';
import IStopArea from '~/models/IStopArea';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import RouteBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import { IStopSectionItem } from '~/services/stopService';
import { CodeListStore } from '~/stores/codeListStore';
import { ConfirmStore } from '~/stores/confirmStore';
import { NodeStore } from '~/stores/nodeStore';
import SidebarHeader from '../SidebarHeader';
import ShortIdInput from './ShortIdInput';
import HastusAreaForm from './hastusAreaForm';
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
    isTransitToggleButtonBarVisible?: boolean;
    toggleTransitType?: (type: TransitType) => void;
    updateStopProperty?: (property: keyof IStop) => (value: any) => void;
    onNodePropertyChange?: (property: keyof INode) => (value: any) => void;
    setCurrentStateIntoNodeCache?: () => void;
    codeListStore?: CodeListStore;
    confirmStore?: ConfirmStore;
    nodeStore?: NodeStore;
}

@inject('codeListStore', 'confirmStore', 'nodeStore')
@observer
class StopForm extends Component<IStopFormProps> {
    private createStopAreaDropdownItems = (stopAreas: IStopArea[]): IDropdownItem[] => {
        return stopAreas.map((stopArea: IStopArea) => {
            const item: IDropdownItem = {
                value: `${stopArea.id}`,
                label: `${stopArea.id} - ${stopArea.nameFi}`
            };
            return item;
        });
    };

    private getShortIdLetterItems = () => {
        const shortIdLetterItems = this.props.codeListStore!.getDropdownItemList('Lyhyttunnus');
        shortIdLetterItems.forEach(item => (item.label = `${item.value} - ${item.label}`));
        return shortIdLetterItems;
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
            name: ''
        });
        this.props.nodeStore!.setOldHastusArea(null);
        this.props.confirmStore!.openConfirm({
            content: (
                <HastusAreaForm
                    isNewHastusArea={true}
                    existingHastusAreas={this.props.hastusAreas}
                />
            ),
            onConfirm: () => {
                this.props.saveHastusArea!({ isNewHastusArea: true });
            },
            confirmButtonText: 'Tallenna',
            confirmType: 'save'
        });
    };

    private openEditHastusAreaModal = () => {
        const currentHastusArea = this.props.hastusAreas.find(
            hastusArea => hastusArea.id === this.props.node!.stop!.hastusId
        );
        this.props.nodeStore!.setHastusArea(currentHastusArea!);
        this.props.nodeStore!.setOldHastusArea(currentHastusArea!);
        this.props.confirmStore!.openConfirm({
            content: (
                <HastusAreaForm
                    isNewHastusArea={false}
                    existingHastusAreas={this.props.hastusAreas.filter(
                        hastusArea => hastusArea.id !== currentHastusArea!.id
                    )}
                />
            ),
            onConfirm: () => {
                this.props.saveHastusArea!({ isNewHastusArea: false });
            },
            confirmButtonText: 'Tallenna',
            confirmType: 'save'
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

    private createHastusAreaDropdownItems = (hastusAreas: IHastusArea[]): IDropdownItem[] => {
        return hastusAreas.map((hastusArea: IHastusArea) => {
            const item: IDropdownItem = {
                value: `${hastusArea.id}`,
                label: `${hastusArea.id} - ${hastusArea.name}`
            };
            return item;
        });
    };

    render() {
        const {
            node,
            isTransitToggleButtonBarVisible,
            isEditingDisabled,
            stopAreas,
            stopSections,
            hastusAreas: hastusAreaItems,
            stopInvalidPropertiesMap,
            nodeInvalidPropertiesMap,
            toggleTransitType,
            onNodePropertyChange,
            updateStopProperty,
            isReadOnly
        } = this.props;
        const stop = node.stop!;
        const currentHastusArea = this.props.hastusAreas.find(
            hastusArea => hastusArea.id === this.props.node!.stop!.hastusId
        );
        return (
            <div className={classnames(s.stopView, s.form)}>
                <SidebarHeader isCloseButtonVisible={true} isBackButtonVisible={true}>
                    Pysäkin tiedot
                </SidebarHeader>
                <div className={s.formSection}>
                    {isTransitToggleButtonBarVisible && (
                        <div className={s.flexRow}>
                            <div className={s.formItem}>
                                <div className={s.inputLabel}>VERKKO</div>
                                <TransitToggleButtonBar
                                    selectedTransitTypes={
                                        stop.transitType ? [stop.transitType] : []
                                    }
                                    toggleSelectedTransitType={toggleTransitType}
                                />
                            </div>
                        </div>
                    )}
                    <div className={s.flexRow}>
                        <Dropdown
                            label='LYHYTTUNNUS (2 kirj.'
                            onChange={this.onShortIdLetterChange}
                            disabled={isEditingDisabled}
                            selected={node.shortIdLetter}
                            emptyItem={{
                                value: '',
                                label: ''
                            }}
                            items={this.getShortIdLetterItems()}
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
                                label: ''
                            }}
                            disabled={isEditingDisabled}
                            label='PYSÄKKIALUE'
                            validationResult={stopInvalidPropertiesMap['stopAreaId']}
                        />
                        {!isReadOnly && stop.stopAreaId && (
                            <>
                                <Button
                                    className={s.dropdownButton}
                                    hasReverseColor={true}
                                    onClick={() => {
                                        this.redirectToStopArea(stop.stopAreaId);
                                    }}
                                >
                                    <FiInfo />
                                </Button>
                                <Button
                                    className={s.dropdownButton}
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
                        />
                        <InputContainer
                            label='OSOITE RUOTSIKSI'
                            disabled={isEditingDisabled}
                            value={stop.addressSw}
                            onChange={updateStopProperty!('addressSw')}
                            validationResult={stopInvalidPropertiesMap['addressSw']}
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
                        />
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
                                label: ''
                            }}
                            disabled={isEditingDisabled}
                            label='VYÖHYKE'
                            validationResult={stopInvalidPropertiesMap['section']}
                        />
                        <Dropdown
                            onChange={updateStopProperty!('roof')}
                            items={this.props.codeListStore!.getDropdownItemList('Pysäkkityyppi')}
                            selected={stop.roof}
                            disabled={isEditingDisabled}
                            label='PYSÄKKIKATOS'
                            validationResult={stopInvalidPropertiesMap['roof']}
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
                        <InputContainer
                            label='ELYNUMERO'
                            disabled={isEditingDisabled}
                            value={stop.elyNumber}
                            validationResult={stopInvalidPropertiesMap['elyNumber']}
                            onChange={updateStopProperty!('elyNumber')}
                        />
                    </div>
                    <div className={s.flexRow}>
                        <Dropdown
                            onChange={updateStopProperty!('hastusId')}
                            items={this.createHastusAreaDropdownItems(hastusAreaItems)}
                            selected={stop.hastusId}
                            emptyItem={{
                                value: '',
                                label: ''
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
