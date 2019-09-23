import React from 'react';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import { IRoutePathLink, INode, IStop, IViaName } from '~/models';
import { FiChevronRight } from 'react-icons/fi';
import { FaAngleRight, FaAngleDown } from 'react-icons/fa';
import TransitTypeHelper from '~/util/TransitTypeHelper';
import { Button, Checkbox, Dropdown } from '~/components/controls';
import ViewFormBase from '~/components/shared/inheritedComponents/ViewFormBase';
import ButtonType from '~/enums/buttonType';
import NodeType from '~/enums/nodeType';
import StartNodeType from '~/enums/startNodeType';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import { RoutePathStore } from '~/stores/routePathStore';
import { CodeListStore } from '~/stores/codeListStore';
import routePathLinkValidationModel from '~/models/validationModels/routePathLinkValidationModel';
import viaNameValidationModel from '~/models/validationModels/viaNameValidationModel';
import FormValidator, { IValidationResult } from '~/validation/FormValidator';
import NodeHelper from '~/util/nodeHelper';
import navigator from '~/routing/navigator';
import TextContainer from '../../../controls/TextContainer';
import InputContainer from '../../../controls/InputContainer';
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
}

interface RoutePathListNodeState {
    isLoading: boolean; // not currently in use, declared because ViewFormBase needs this
    invalidPropertiesMap: object;
    isEditingDisabled: boolean; // not currently in use, declared because ViewFormBase needs this
}

@inject('routePathStore', 'codeListStore')
@observer
class RoutePathListNode extends ViewFormBase<
    IRoutePathListNodeProps,
    RoutePathListNodeState
> {
    constructor(props: IRoutePathListNodeProps) {
        super(props);
        this.state = {
            isLoading: false,
            invalidPropertiesMap: {},
            isEditingDisabled: false
        };
    }

    componentDidMount() {
        this.validateLink();
    }

    componentDidUpdate(prevProps: IRoutePathListNodeProps) {
        if (prevProps.isEditingDisabled && !this.props.isEditingDisabled) {
            this.validateLink();
        }
    }

    private validateLink = () => {
        this.validateAllProperties(
            routePathLinkValidationModel,
            this.props.routePathLink
        );
        const orderNumber = this.props.routePathLink.orderNumber;

        const viaName = this.props.routePathStore!.getViaName(
            +this.props.routePathLink.id
        );

        let isViaNameDestinationFi1Valid = true;
        if (viaName) {
            isViaNameDestinationFi1Valid = this.validateViaNames(viaName);
        }

        const isLinkFormValid =
            this.isFormValid() &&
            isViaNameDestinationFi1Valid;

        this.props.routePathStore!.setLinkFormValidity(
            orderNumber,
            isLinkFormValid
        );
    };

    private validateViaNames = (viaName: IViaName) => {
        const attributeNames = [
            'destinationFi1',
            'destinationSw1',
            'destinationFi2',
            'destinationSw2'
        ];

        let isValid = true;
        attributeNames.forEach((attribute: string) => {
            if (viaName[attribute]) {
                const validationResult: IValidationResult = FormValidator.validate(
                    viaName![attribute],
                    viaNameValidationModel[attribute]
                );
                this.setValidatorResult(attribute, validationResult);
                if (!validationResult.isValid) isValid = false;
            };
        });

        return isValid;
    };

    private renderHeader = () => {
        const node = this.props.node;
        const stopName = node.stop ? node.stop.nameFi : '';
        const isExtended = this.props.routePathStore!.isListItemExtended(
            node.id
        );
        const nodeTypeName = NodeHelper.getNodeTypeName(node.type);
        const shortId = NodeHelper.getShortId(node);
        return (
            <div
                className={classnames(
                    s.itemHeader,
                    isExtended ? s.itemExtended : null
                )}
            >
                <div className={s.headerContent}>
                    <div className={s.headerNodeTypeContainer}>
                        <div>
                            {node.type === NodeType.STOP
                                ? stopName
                                : nodeTypeName}
                        </div>
                    </div>
                    <div className={s.label}>
                        <div className={s.headerContentDescription}>
                            <div className={s.hastusId}>
                                {node.stop && node.stop.hastusId
                                    ? node.stop.hastusId
                                    : ''}
                            </div>
                            <div className={s.longId}>{node.id}</div>
                            <div className={s.shortId}>{shortId || '?'}</div>
                        </div>
                    </div>
                </div>
                <div className={s.itemToggle}>
                    {isExtended && <FaAngleDown />}
                    {!isExtended && <FaAngleRight />}
                </div>
            </div>
        );
    };

    private onRoutePathLinkStartNodeTypeChange = () => (value: any) => {
        this.onRoutePathLinkPropertyChange('startNodeType')(value ? 'E' : 'P');
    };

    private onRoutePathLinkPropertyChange = (
        property: keyof IRoutePathLink
    ) => (value: any) => {
        const orderNumber = this.props.routePathLink.orderNumber;

        this.props.routePathStore!.updateRoutePathLinkProperty(
            orderNumber,
            property,
            value
        );
        this.validateProperty(
            routePathLinkValidationModel[property],
            property,
            value
        );
        const isLinkFormValid = this.isFormValid();
        this.props.routePathStore!.setLinkFormValidity(
            orderNumber,
            isLinkFormValid
        );
    };

    /**
     * A special onChange function for the following properties:
     * isStartNodeUsingBookSchedule & startNodeBookScheduleColumnNumber
     * note: the last rpLink link will change routePath's value instead of routePathLink's value
     */
    private onRoutePathBookSchedulePropertyChange = (
        property:
            | 'startNodeBookScheduleColumnNumber'
            | 'isStartNodeUsingBookSchedule'
    ) => (value: any) => {
        const orderNumber = this.props.routePathLink.orderNumber;

        if (this.props.isLastNode) {
            this.props.routePathStore!.updateRoutePathProperty(property, value);
        } else {
            this.props.routePathStore!.updateRoutePathLinkProperty(
                orderNumber,
                property,
                value
            );
        }
        this.validateProperty(
            routePathLinkValidationModel[property],
            property,
            value
        );
        const isLinkFormValid = this.isFormValid();
        this.props.routePathStore!.setLinkFormValidity(
            orderNumber,
            isLinkFormValid
        );
    };

    private onViaNameChange = (value: string, attributeName: string) => {
        const routePathLinkId = +this.props.routePathLink.id;
        let viaName = _.cloneDeep(
            this.props.routePathStore!.getViaName(routePathLinkId)
        );

        if (!viaName) {
            viaName = {
                relid: routePathLinkId,
                destinationFi1: '',
                destinationFi2: '',
                destinationSw1: '',
                destinationSw2: ''
            };
        }
        viaName[attributeName] = value;
        this.props.routePathStore!.setViaName(viaName);
        this.validateLink();
    };

    private onIsStartNodeUsingBookScheduleChange = (value: boolean) => () => {
        this.onRoutePathBookSchedulePropertyChange(
            'isStartNodeUsingBookSchedule'
        )(value);
    };

    private renderStopView = (stop: IStop) => {
        const isEditingDisabled = this.props.isEditingDisabled;
        const invalidPropertiesMap = this.state.invalidPropertiesMap;

        const routePath = this.props.routePathStore!.routePath;
        const routePathLink = this.props.routePathLink;
        const viaName = this.props.routePathStore!.getViaName(
            +routePathLink.id
        );
        const isStartNodeUsingBookSchedule = this.props.isLastNode
            ? routePath!.isStartNodeUsingBookSchedule
            : routePathLink.isStartNodeUsingBookSchedule;
        const startNodeBookScheduleColumnNumber = this.props.isLastNode
            ? routePath!.startNodeBookScheduleColumnNumber
            : routePathLink.startNodeBookScheduleColumnNumber;

        return (
            <div>
                <div className={s.flexRow}>
                    <TextContainer
                        label='PYSÄKIN NIMI'
                        value={stop.nameFi}
                        darkerInputLabel={true}
                    />
                    <TextContainer
                        label='PYSÄKIN NIMI RUOTSIKSI'
                        value={stop.nameSw}
                        darkerInputLabel={true}
                    />
                </div>
                {!this.props.isLastNode && (
                    <>
                        <div className={s.flexRow}>
                            <Checkbox
                                disabled={isEditingDisabled}
                                content='Pysäkki ei käytössä'
                                checked={
                                    routePathLink.startNodeType ===
                                    StartNodeType.DISABLED
                                }
                                onClick={this.onRoutePathLinkStartNodeTypeChange()}
                            />
                        </div>
                        <div className={s.flexRow}>
                            <Checkbox
                                disabled={isEditingDisabled}
                                checked={Boolean(
                                    routePathLink.isStartNodeHastusStop
                                )}
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
                                selected={
                                    routePathLink.startNodeTimeAlignmentStop
                                }
                                items={this.props.codeListStore!.getDropdownItemList(
                                    'Ajantasaus pysakki'
                                )}
                            />
                            <Dropdown
                                label='ERIKOISTYYPPI'
                                onChange={this.onRoutePathLinkPropertyChange(
                                    'startNodeUsage'
                                )}
                                disabled={isEditingDisabled}
                                selected={routePathLink.startNodeUsage}
                                items={this.props.codeListStore!.getDropdownItemList(
                                    'Pysäkin käyttö'
                                )}
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
                        disabled={
                            isEditingDisabled || !isStartNodeUsingBookSchedule
                        }
                        type='number'
                        label='PYSÄKIN SARAKENUMERO KIRJA-AIKATAULUSSA'
                        onChange={this.onRoutePathBookSchedulePropertyChange(
                            'startNodeBookScheduleColumnNumber'
                        )}
                        value={startNodeBookScheduleColumnNumber}
                        validationResult={
                            invalidPropertiesMap[
                                'startNodeBookScheduleColumnNumber'
                            ]
                        }
                        darkerInputLabel={true}
                    />
                </div>
                <div className={s.flexInnerRow}>
                    <TextContainer
                        label='MUOKANNUT'
                        value={routePathLink.modifiedBy}
                        darkerInputLabel={true}
                    />
                    <TextContainer
                        label='MUOKATTU PVM'
                        isTimeIncluded={true}
                        value={routePathLink.modifiedOn}
                        darkerInputLabel={true}
                    />
                </div>
                <div className={s.flexInnerRow}>
                    <InputContainer
                        label='1. MÄÄRÄNPÄÄ SUOMEKSI'
                        disabled={isEditingDisabled}
                        value={viaName ? viaName.destinationFi1 : ''}
                        validationResult={
                            invalidPropertiesMap['destinationFi1']
                        }
                        onChange={e =>
                            this.onViaNameChange(e, 'destinationFi1')
                        }
                    />
                    <InputContainer
                        label='2. MÄÄRÄNPÄÄ SUOMEKSI'
                        disabled={isEditingDisabled}
                        value={viaName ? viaName.destinationFi2 : ''}
                        validationResult={
                            invalidPropertiesMap['destinationFi2']
                        }
                        onChange={e =>
                            this.onViaNameChange(e, 'destinationFi2')
                        }
                    />
                </div>
                <div className={s.flexInnerRow}>
                    <InputContainer
                        label='1. MÄÄRÄNPÄÄ RUOTSIKSI'
                        disabled={isEditingDisabled}
                        value={viaName ? viaName.destinationSw1 : ''}
                        validationResult={
                            invalidPropertiesMap['destinationSw1']
                        }
                        onChange={e =>
                            this.onViaNameChange(e, 'destinationSw1')
                        }
                    />
                    <InputContainer
                        label='2. MÄÄRÄNPÄÄ RUOTSIKSI'
                        disabled={isEditingDisabled}
                        value={viaName ? viaName.destinationSw2 : ''}
                        validationResult={
                            invalidPropertiesMap['destinationSw2']
                        }
                        onChange={e =>
                            this.onViaNameChange(e, 'destinationSw2')
                        }
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
                    darkerInputLabel={true}
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
                    !this.props.isLastNode &&
                        routePathLink.startNodeTimeAlignmentStop !== '0'
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
                icon = this.addBorder(icon, TransitTypeHelper.getColor(type));
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
        return (
            <div className={s.extendedContent}>
                {Boolean(this.props.node.stop) &&
                    this.renderStopView(this.props.node.stop!)}
                {this.renderNodeView(this.props.node)}
                <div className={s.footer}>
                    <Button
                        onClick={this.openInNetworkView}
                        type={ButtonType.SQUARE}
                    >
                        <div>Avaa solmu verkkonäkymässä</div>
                        <FiChevronRight />
                    </Button>
                </div>
            </div>
        );
    };

    private openInNetworkView = () => {
        const editNetworkLink = routeBuilder
            .to(SubSites.node)
            .toTarget(':id', this.props.node.id)
            .toLink();
        navigator.goTo(editNetworkLink);
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
        const geometry = this.props.routePathStore!.getNodeGeom(
            this.props.node.id
        );
        return (
            <RoutePathListItem
                reference={this.props.reference}
                id={this.props.node.id}
                geometry={geometry}
                shadowClass={this.getShadowClass()}
                header={this.renderHeader()}
                body={this.renderBody()}
                listIcon={this.renderListIcon()}
            />
        );
    }
}

export default RoutePathListNode;
