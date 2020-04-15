import * as L from 'leaflet';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { FaAngleDown, FaAngleRight } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import { Button, Checkbox, Dropdown } from '~/components/controls';
import TransitTypeNodeIcon from '~/components/shared/TransitTypeNodeIcon';
import ButtonType from '~/enums/buttonType';
import NodeType from '~/enums/nodeType';
import StartNodeType from '~/enums/startNodeType';
import ToolbarToolType from '~/enums/toolbarToolType';
import { INode, IRoutePathLink, IStop } from '~/models';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import { CodeListStore } from '~/stores/codeListStore';
import { ErrorStore } from '~/stores/errorStore';
import { MapStore } from '~/stores/mapStore';
import { RoutePathLinkMassEditStore } from '~/stores/routePathLinkMassEditStore';
import { RoutePathStore } from '~/stores/routePathStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import NodeUtils from '~/utils/NodeUtils';
import InputContainer from '../../../controls/InputContainer';
import TextContainer from '../../../controls/TextContainer';
import RoutePathListItem from './RoutePathListItem';
import * as s from './routePathListItem.scss';

interface IRoutePathListNodeProps {
    node: INode;
    routePathLink: IRoutePathLink;
    isEditingDisabled: boolean;
    isLastNode?: boolean;
    isFirstNode?: boolean;
    routePathLinkMassEditStore?: RoutePathLinkMassEditStore;
    routePathStore?: RoutePathStore;
    codeListStore?: CodeListStore;
    mapStore?: MapStore;
    toolbarStore?: ToolbarStore;
    errorStore?: ErrorStore;
}

@inject(
    'routePathStore',
    'codeListStore',
    'mapStore',
    'routePathLinkMassEditStore',
    'toolbarStore',
    'errorStore'
)
@observer
class RoutePathListNode extends React.Component<IRoutePathListNodeProps> {
    private renderHeader = () => {
        const node = this.props.node;
        const routePathLink = this.props.routePathLink;
        const stopName = node.stop ? node.stop.nameFi : '';
        const isExtended = this.props.routePathStore!.isListItemExtended(node.id);
        const nodeTypeName = NodeUtils.getNodeTypeName(node.type);
        const shortId = NodeUtils.getShortId(node);
        const subTopic = node.type === NodeType.STOP ? stopName : nodeTypeName;
        const isLastNode = this.props.isLastNode;
        return (
            <div className={s.itemHeader} onClick={this.toggleIsExtended} data-cy='itemHeader'>
                <div className={s.headerSubtopicContainer} title={subTopic}>
                    {subTopic}
                </div>
                <div className={s.headerContent}>
                    <div className={s.hastusId}>
                        {node.stop && node.stop.hastusId ? node.stop.hastusId : ''}
                    </div>
                    <div className={s.longId}>{node.id}</div>
                    <div className={s.shortId}>{shortId ? shortId : ''}</div>
                    <div className={s.viaWrapper}>
                        {!isLastNode && (
                            <>
                                <div className={s.via}>
                                    {routePathLink.destinationFi1
                                        ? routePathLink.destinationFi1
                                        : ''}
                                </div>
                                <div className={s.via}>
                                    {routePathLink.destinationFi2
                                        ? routePathLink.destinationFi2
                                        : ''}
                                </div>
                            </>
                        )}
                    </div>
                    <div className={s.viaShield}>
                        {!isLastNode && routePathLink.destinationShieldFi
                            ? routePathLink.destinationShieldFi
                            : ''}
                    </div>
                    <div className={s.itemToggle}>
                        {isExtended && <FaAngleDown />}
                        {!isExtended && <FaAngleRight />}
                    </div>
                </div>
            </div>
        );
    };

    private isNodeSelected = () => {
        return (
            !this.props.isLastNode &&
            this.props.node.type === NodeType.STOP &&
            this.props.routePathLinkMassEditStore!.getSelectedRoutePathLinkIndex(
                this.props.routePathLink
            ) > -1
        );
    };

    private toggleIsExtended = () => {
        if (
            !this.props.isLastNode &&
            this.props.node.type === NodeType.STOP &&
            this.props.routePathLinkMassEditStore!.isMassEditSelectionEnabled
        ) {
            const selectedTool = this.props.toolbarStore!.selectedTool;
            if (selectedTool && selectedTool.toolType !== ToolbarToolType.SelectNetworkEntity) {
                this.props.errorStore!.addError(
                    `Pysäkkien massa editointi editointi estetty, sulje ensin aktiivinen karttatyökalu.`
                );
                return;
            }
            this.props.routePathStore!.setIsEditingDisabled(false);
            this.props.routePathLinkMassEditStore!.toggleSelectedRoutePathLink(
                this.props.routePathLink
            );
        } else {
            this.props.routePathStore!.toggleExtendedListItem(this.props.node.id);

            if (this.props.routePathStore!.isListItemExtended(this.props.node.id)) {
                this.props.mapStore!.setMapBounds(this.getBounds());
            }
        }
    };

    private getBounds = () => {
        const geometry = this.props.routePathStore!.getLinkGeom(this.props.routePathLink.id);
        const bounds: L.LatLngBounds = new L.LatLngBounds([]);
        geometry.forEach((geom: L.LatLng) => bounds.extend(geom));
        return bounds;
    };

    private onRoutePathLinkStartNodeTypeChange = () => (value: any) => {
        this.onRoutePathLinkPropertyChange('startNodeType')(value ? 'E' : 'P');
    };

    private onRoutePathLinkPropertyChange = (property: keyof IRoutePathLink) => (value: any) => {
        const orderNumber = this.props.routePathLink.orderNumber;
        this.props.routePathStore!.updateRoutePathLinkProperty(orderNumber, property, value);
    };

    /**
     * A special onChange function for the following properties:
     * isStartNodeUsingBookSchedule & startNodeBookScheduleColumnNumber
     * note: the last rpLink link will change routePath's value instead of routePathLink's value
     */
    private onRoutePathBookSchedulePropertyChange = (
        property: 'startNodeBookScheduleColumnNumber' | 'isStartNodeUsingBookSchedule'
    ) => (value: any) => {
        const orderNumber = this.props.routePathLink.orderNumber;

        if (this.props.isLastNode) {
            this.props.routePathStore!.updateRoutePathProperty(property, value);
        } else {
            this.props.routePathStore!.updateRoutePathLinkProperty(orderNumber, property, value);
        }
    };

    private onIsStartNodeUsingBookScheduleChange = (value: boolean) => () => {
        this.onRoutePathBookSchedulePropertyChange('isStartNodeUsingBookSchedule')(value);
    };

    private renderStopView = (stop: IStop) => {
        const isEditingDisabled = this.props.isEditingDisabled;
        const routePath = this.props.routePathStore!.routePath;
        const routePathLink = this.props.routePathLink;
        const isStartNodeUsingBookSchedule = this.props.isLastNode
            ? routePath!.isStartNodeUsingBookSchedule
            : routePathLink.isStartNodeUsingBookSchedule;
        const startNodeBookScheduleColumnNumber = this.props.isLastNode
            ? routePath!.startNodeBookScheduleColumnNumber
            : routePathLink.startNodeBookScheduleColumnNumber;

        const invalidPropertiesMap = this.props.routePathStore!.getRoutePathLinkInvalidPropertiesMap(
            routePathLink.id
        );

        return (
            <div>
                <div className={s.flexRow}>
                    <TextContainer
                        label='PYSÄKIN NIMI'
                        value={stop.nameFi}
                        isInputLabelDarker={true}
                    />
                    <TextContainer
                        label='PYSÄKIN NIMI RUOTSIKSI'
                        value={stop.nameSw}
                        isInputLabelDarker={true}
                    />
                </div>
                {!this.props.isLastNode && (
                    <>
                        <div className={s.flexRow}>
                            <Checkbox
                                disabled={isEditingDisabled}
                                content='Pysäkki ei käytössä'
                                checked={routePathLink.startNodeType === StartNodeType.DISABLED}
                                onClick={this.onRoutePathLinkStartNodeTypeChange()}
                            />
                        </div>
                        <div className={s.flexRow}>
                            <Checkbox
                                disabled={isEditingDisabled}
                                checked={Boolean(routePathLink.isStartNodeHastusStop)}
                                content='Hastus paikka'
                                onClick={this.onRoutePathLinkPropertyChange(
                                    'isStartNodeHastusStop'
                                )}
                            />
                        </div>
                        <div className={s.flexRow}>
                            <Dropdown
                                label='AJANTASAUSPYSÄKKI'
                                onChange={this.onRoutePathLinkPropertyChange(
                                    'startNodeTimeAlignmentStop'
                                )}
                                disabled={isEditingDisabled}
                                selected={routePathLink.startNodeTimeAlignmentStop}
                                items={this.props.codeListStore!.getDropdownItemList(
                                    'Ajantasaus pysakki'
                                )}
                                isInputLabelDarker={true}
                            />
                            <Dropdown
                                label='ERIKOISTYYPPI'
                                onChange={this.onRoutePathLinkPropertyChange('startNodeUsage')}
                                disabled={isEditingDisabled}
                                selected={routePathLink.startNodeUsage}
                                items={this.props.codeListStore!.getDropdownItemList(
                                    'Pysäkin käyttö'
                                )}
                                isInputLabelDarker={true}
                            />
                        </div>
                        <div className={s.flexRow}>
                            <InputContainer
                                label='1. MÄÄRÄNPÄÄ SUOMEKSI'
                                disabled={isEditingDisabled}
                                value={routePathLink.destinationFi1}
                                validationResult={invalidPropertiesMap['destinationFi1']}
                                onChange={this.onRoutePathLinkPropertyChange('destinationFi1')}
                                isInputLabelDarker={true}
                                data-cy='destinationFi1'
                            />
                            <InputContainer
                                label='2. MÄÄRÄNPÄÄ SUOMEKSI'
                                disabled={isEditingDisabled}
                                value={routePathLink.destinationFi2}
                                validationResult={invalidPropertiesMap['destinationFi2']}
                                onChange={this.onRoutePathLinkPropertyChange('destinationFi2')}
                                isInputLabelDarker={true}
                            />
                        </div>
                        <div className={s.flexRow}>
                            <InputContainer
                                label='1. MÄÄRÄNPÄÄ RUOTSIKSI'
                                disabled={isEditingDisabled}
                                value={routePathLink.destinationSw1}
                                validationResult={invalidPropertiesMap['destinationSw1']}
                                onChange={this.onRoutePathLinkPropertyChange('destinationSw1')}
                                isInputLabelDarker={true}
                            />
                            <InputContainer
                                label='2. MÄÄRÄNPÄÄ RUOTSIKSI'
                                disabled={isEditingDisabled}
                                value={routePathLink.destinationSw2}
                                validationResult={invalidPropertiesMap['destinationSw2']}
                                onChange={this.onRoutePathLinkPropertyChange('destinationSw2')}
                                isInputLabelDarker={true}
                            />
                        </div>
                        <div className={s.flexRow}>
                            <InputContainer
                                label='1. MÄÄRÄNPÄÄ KILPI SUOMEKSI'
                                disabled={isEditingDisabled}
                                value={routePathLink.destinationShieldFi}
                                validationResult={invalidPropertiesMap['destinationShieldFi']}
                                onChange={this.onRoutePathLinkPropertyChange('destinationShieldFi')}
                                isInputLabelDarker={true}
                                data-cy='destinationShieldFi'
                            />
                            <InputContainer
                                label='2. MÄÄRÄNPÄÄ KILPI RUOTSIKSI'
                                disabled={isEditingDisabled}
                                value={routePathLink.destinationShieldSw}
                                validationResult={invalidPropertiesMap['destinationShieldSw']}
                                onChange={this.onRoutePathLinkPropertyChange('destinationShieldSw')}
                                isInputLabelDarker={true}
                            />
                        </div>
                    </>
                )}
                <div className={s.flexRow}>
                    <Checkbox
                        disabled={isEditingDisabled}
                        checked={Boolean(isStartNodeUsingBookSchedule)}
                        content='Ohitusaika kirja-aikataulussa'
                        onClick={this.onIsStartNodeUsingBookScheduleChange(
                            !isStartNodeUsingBookSchedule
                        )}
                    />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        disabled={isEditingDisabled || !isStartNodeUsingBookSchedule}
                        type='number'
                        label='PYSÄKIN SARAKENUMERO KIRJA-AIKATAULUSSA'
                        onChange={this.onRoutePathBookSchedulePropertyChange(
                            'startNodeBookScheduleColumnNumber'
                        )}
                        value={startNodeBookScheduleColumnNumber}
                        validationResult={invalidPropertiesMap['startNodeBookScheduleColumnNumber']}
                        isInputLabelDarker={true}
                    />
                </div>
                <div className={s.flexRow}>
                    <TextContainer
                        label='MUOKANNUT'
                        value={routePathLink.modifiedBy}
                        isInputLabelDarker={true}
                    />
                    <TextContainer
                        label='MUOKATTU PVM'
                        isTimeIncluded={true}
                        value={routePathLink.modifiedOn}
                        isInputLabelDarker={true}
                    />
                </div>
            </div>
        );
    };

    private renderNodeView = (node: INode) => {
        return (
            <div className={s.flexRow}>
                <TextContainer
                    label='MITTAUSPÄIVÄMÄÄRÄ'
                    value={node.measurementDate}
                    isInputLabelDarker={true}
                />
            </div>
        );
    };

    private renderBody = () => {
        const node = this.props.node;
        return (
            <>
                {Boolean(node.stop) && this.renderStopView(node.stop!)}
                {this.renderNodeView(node)}
                <div className={s.footer}>
                    <Button onClick={() => this.openNodeInNewTab(node.id)} type={ButtonType.SQUARE}>
                        <div>Avaa solmu</div>
                        <FiExternalLink />
                    </Button>
                </div>
            </>
        );
    };

    private openNodeInNewTab = (nodeId: string) => {
        const nodeViewLink = routeBuilder
            .to(SubSites.node)
            .toTarget(':id', nodeId)
            .toLink();
        window.open(nodeViewLink, '_blank');
    };

    private getShadowClass() {
        let shadowClass;
        if (this.props.node!.stop) {
            shadowClass = s.shadowStop;
        } else {
            shadowClass = s.shadow;
        }
        return shadowClass;
    }

    render() {
        const { node, routePathLink, isFirstNode, isLastNode } = this.props;
        return (
            <RoutePathListItem
                id={node.id}
                shadowClass={this.getShadowClass()}
                header={this.renderHeader()}
                body={this.renderBody()}
                listIcon={
                    <TransitTypeNodeIcon
                        nodeType={node.type}
                        transitTypes={node.transitTypes}
                        isTimeAlignmentStop={
                            !isLastNode && routePathLink.startNodeTimeAlignmentStop !== '0'
                        }
                        isDisabled={
                            !isLastNode && routePathLink.startNodeType === StartNodeType.DISABLED
                        }
                    />
                }
                isFirstNode={isFirstNode}
                isLastNode={isLastNode}
                isItemHighlighted={this.isNodeSelected()}
            />
        );
    }
}

export default RoutePathListNode;
