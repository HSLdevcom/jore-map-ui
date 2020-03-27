import classnames from 'classnames';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { FaAngleDown, FaAngleRight } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import { Button, Checkbox, Dropdown } from '~/components/controls';
import ButtonType from '~/enums/buttonType';
import NodeType from '~/enums/nodeType';
import StartNodeType from '~/enums/startNodeType';
import { INode, IRoutePathLink, IStop } from '~/models';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import { CodeListStore } from '~/stores/codeListStore';
import { RoutePathStore } from '~/stores/routePathStore';
import NodeUtils from '~/utils/NodeUtils';
import TransitTypeUtils from '~/utils/TransitTypeUtils';
import InputContainer from '../../../controls/InputContainer';
import TextContainer from '../../../controls/TextContainer';
import RoutePathListItem from './RoutePathListItem';
import * as s from './routePathListItem.scss';

interface IRoutePathListNodeProps {
    routePathStore?: RoutePathStore;
    codeListStore?: CodeListStore;
    node: INode;
    reference: React.RefObject<HTMLDivElement>;
    routePathLink: IRoutePathLink;
    isEditingDisabled: boolean;
    isLastNode?: boolean;
    isFirstNode?: boolean;
}

@inject('routePathStore', 'codeListStore')
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
        return (
            <>
                <div className={s.headerSubtopicContainer} title={subTopic}>
                    {subTopic}
                </div>
                <div className={s.headerContent}>
                    <div className={s.hastusId}>
                        {node.stop && node.stop.hastusId ? node.stop.hastusId : ''}
                    </div>
                    <div className={s.longId}>{node.id}</div>
                    <div className={s.shortId}>{shortId || '?'}</div>
                    <div className={s.via}>
                        {routePathLink.destinationFi1 ? routePathLink.destinationFi1 : ''}
                    </div>
                    <div className={s.via}>
                        {routePathLink.destinationShieldFi ? routePathLink.destinationShieldFi : ''}
                    </div>
                    <div className={s.itemToggle}>
                        {isExtended && <FaAngleDown />}
                        {!isExtended && <FaAngleRight />}
                    </div>
                </div>
            </>
        );
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

    private renderListIcon = () => {
        const node = this.props.node;
        const routePathLink = this.props.routePathLink;
        let icon = (
            <div
                className={classnames(
                    s.nodeIcon,
                    !this.props.isLastNode && routePathLink.startNodeTimeAlignmentStop !== '0'
                        ? s.timeAlignmentIcon
                        : undefined
                )}
            />
        );
        const isNodeDisabled =
            !this.props.isLastNode &&
            this.props.routePathLink.startNodeType === StartNodeType.DISABLED;

        if (node.type === NodeType.MUNICIPALITY_BORDER) {
            icon = this.addBorder(icon, '#c900ff');
        } else if (node.type === NodeType.CROSSROAD) {
            icon = this.addBorder(icon, '#727272');
        } else if (isNodeDisabled) {
            icon = this.addBorder(icon, '#353333');
        } else if (node.type === NodeType.STOP) {
            node.transitTypes!.forEach(type => {
                icon = this.addBorder(icon, TransitTypeUtils.getColor(type));
            });
        }

        return icon;
    };

    private addBorder = (icon: React.ReactNode, color: string) => {
        return (
            <div className={s.iconBorder} style={{ borderColor: color }}>
                {icon}
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
        const geometry = this.props.routePathStore!.getNodeGeom(this.props.node.id);
        return (
            <RoutePathListItem
                reference={this.props.reference}
                id={this.props.node.id}
                geometry={geometry}
                shadowClass={this.getShadowClass()}
                header={this.renderHeader()}
                body={this.renderBody()}
                listIcon={this.renderListIcon()}
                isFirstNode={this.props.isFirstNode}
                isLastNode={this.props.isLastNode}
            />
        );
    }
}

export default RoutePathListNode;
