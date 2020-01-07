import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { FiInfo } from 'react-icons/fi';
import { match } from 'react-router';
import { Button, Dropdown, TransitToggleButtonBar } from '~/components/controls';
import { IDropdownItem } from '~/components/controls/Dropdown';
import InputContainer from '~/components/controls/InputContainer';
import TextContainer from '~/components/controls/TextContainer';
import ButtonType from '~/enums/buttonType';
import TransitType from '~/enums/transitType';
import { INode, IStop } from '~/models';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import RouteBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import { IStopAreaItem } from '~/services/stopAreaService';
import { CodeListStore } from '~/stores/codeListStore';
import SidebarHeader from '../SidebarHeader';
import ShortIdInput from './ShortIdInput';
import * as s from './stopForm.scss';

interface IStopFormProps {
    node: INode;
    isNewStop: boolean;
    isEditingDisabled: boolean;
    stopAreas: IStopAreaItem[];
    stopSections: IDropdownItem[];
    stopInvalidPropertiesMap: object;
    nodeInvalidPropertiesMap: object;
    match?: match<any>;
    isReadOnly?: boolean;
    isTransitToggleButtonBarVisible?: boolean;
    toggleTransitType?: (type: TransitType) => void;
    updateStopProperty?: (property: keyof IStop) => (value: any) => void;
    onNodePropertyChange?: (property: keyof INode) => (value: any) => void;
    setCurrentStateIntoNodeCache?: () => void;
    codeListStore?: CodeListStore;
}

@inject('codeListStore')
@observer
class StopForm extends Component<IStopFormProps> {
    private createStopAreaDropdownItems = (stopAreas: IStopAreaItem[]): IDropdownItem[] => {
        return stopAreas.map((stopArea: IStopAreaItem) => {
            const item: IDropdownItem = {
                value: `${stopArea.pysalueid}`,
                label: `${stopArea.pysalueid} - ${stopArea.nimi}`
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
        navigator.goTo(routePathViewLink);
    };

    private redirectToNewStopArea = () => {
        this.props.setCurrentStateIntoNodeCache!();
        const node = this.props.node;
        let url;
        if (this.props.isNewStop) {
            url = RouteBuilder.to(SubSites.newStopArea)
                .append(
                    QueryParams.latLng,
                    `${node.coordinatesProjection.lat}:${node.coordinatesProjection.lng}`
                )
                .toLink();
        } else {
            url = RouteBuilder.to(SubSites.newStopArea)
                .append(QueryParams.nodeId, node.id)
                .toLink();
        }

        navigator.goTo(url);
    };

    render() {
        const {
            node,
            isTransitToggleButtonBarVisible,
            isEditingDisabled,
            stopAreas,
            stopSections,
            stopInvalidPropertiesMap,
            nodeInvalidPropertiesMap,
            toggleTransitType,
            onNodePropertyChange,
            updateStopProperty,
            isReadOnly
        } = this.props;
        const stop = node.stop!;
        return (
            <div className={classnames(s.stopView, s.form)}>
                <SidebarHeader isCloseButtonVisible={true} hideBackButton={true}>
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
                            <Button
                                className={s.editStopAreaButton}
                                hasReverseColor={true}
                                onClick={() => {
                                    this.redirectToStopArea(stop.stopAreaId);
                                }}
                            >
                                <FiInfo />
                            </Button>
                        )}
                    </div>
                    {!isReadOnly && (
                        <div className={s.flexRow}>
                            <Button
                                onClick={() => this.redirectToNewStopArea()}
                                type={ButtonType.SQUARE}
                                className={s.createNewStopAreaButton}
                            >
                                Luo uusi pysäkkialue
                            </Button>
                        </div>
                    )}
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
                    <div className={s.sectionHeader}>Muu tiedot</div>
                    <div className={s.flexRow}>
                        <Dropdown
                            onChange={updateStopProperty!('section')}
                            items={stopSections}
                            selected={stop.section}
                            emptyItem={{
                                value: '',
                                label: ''
                            }}
                            disabled={isEditingDisabled}
                            label='VYÖHYKE'
                            validationResult={stopInvalidPropertiesMap['section']}
                        />
                        <InputContainer
                            label='HASTUS-PAIKKA'
                            disabled={isEditingDisabled}
                            value={stop.hastusId}
                            validationResult={stopInvalidPropertiesMap['hastusId']}
                            onChange={updateStopProperty!('hastusId')}
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
                        <InputContainer
                            label='ELYNUMERO'
                            disabled={isEditingDisabled}
                            value={stop.elyNumber}
                            validationResult={stopInvalidPropertiesMap['elyNumber']}
                            onChange={updateStopProperty!('elyNumber')}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default StopForm;
