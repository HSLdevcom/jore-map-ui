import React from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import { IRoutePathLink, INode, IStop } from '~/models';
import { FiChevronRight } from 'react-icons/fi';
import { FaAngleRight, FaAngleDown } from 'react-icons/fa';
import TransitTypeHelper from '~/util/TransitTypeHelper';
import { Button, Checkbox } from '~/components/controls';
import ViewFormBase from '~/components/shared/inheritedComponents/ViewFormBase';
import ButtonType from '~/enums/buttonType';
import NodeType from '~/enums/nodeType';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import { RoutePathStore } from '~/stores/routePathStore';
import routePathLinkValidationModel from '~/models/validationModels/routePathLinkValidationModel';
import NodeHelper from '~/util/nodeHelper';
import navigator from '~/routing/navigator';
import TextContainer from '../../TextContainer';
import InputContainer from '../../InputContainer';
import MultiTabTextarea from '../../linkView/MultiTabTextarea';
import RoutePathListItem from './RoutePathListItem';
import * as s from './routePathListItem.scss';

interface IRoutePathListNodeProps {
    routePathStore?: RoutePathStore;
    node: INode;
    reference: React.RefObject<HTMLDivElement>;
    routePathLink: IRoutePathLink;
    isEditingDisabled: boolean;
}

interface RoutePathListNodeState {
    isLoading: boolean; // not currently in use, declared because ViewFormBase needs this
    invalidPropertiesMap: object;
    isEditingDisabled: boolean; // not currently in use, declared because ViewFormBase needs this
}

@inject('routePathStore')
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
        const isLinkFormValid = this.isFormValid();
        const orderNumber = this.props.routePathLink.orderNumber;
        this.props.routePathStore!.setLinkFormValidity(
            orderNumber,
            isLinkFormValid
        );
    };

    private onCheckboxChange = (property: string, value: boolean) => () => {
        const orderNumber = this.props.routePathLink.orderNumber;
        this.props.routePathStore!.updateRoutePathLinkProperty(
            orderNumber,
            property,
            !value
        );
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

    // TODO: remove this dummy function
    private onChange = () => {};

    private onRoutePathLinkPropertyChange = (property: string) => (
        value: any
    ) => {
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

    private renderStopView = (stop: IStop) => {
        const isEditingDisabled = this.props.isEditingDisabled;
        const invalidPropertiesMap = this.state.invalidPropertiesMap;
        const routePathLink = this.props.routePathLink;

        return (
            <div className={s.stopContent}>
                Pysäkin tiedot
                <div className={s.flexRow}>
                    <TextContainer label='PYSÄKIN NIMI' value={stop.nameFi} />
                    <TextContainer
                        label='PYSÄKIN NIMI RUOTSIKSI'
                        value={stop.nameSe}
                    />
                </div>
                <div className={s.flexRow}>
                    <Checkbox
                        disabled={isEditingDisabled}
                        content='Pysäkki ei käytössä'
                        checked={false}
                        onClick={this.onChange}
                    />
                </div>
                <div className={s.flexRow}>
                    <Checkbox
                        disabled={isEditingDisabled}
                        content='Ajantasauspysäkki'
                        checked={false}
                        onClick={this.onChange}
                    />
                </div>
                <div className={s.flexRow}>
                    {/* rpLink.isStartNodeTimeAlignmentStop */}
                    <Checkbox
                        disabled={isEditingDisabled}
                        checked={false}
                        content='Hastus paikka'
                        onClick={this.onChange}
                    />
                </div>
                <div className={s.flexRow}>
                    <Checkbox
                        disabled={isEditingDisabled}
                        checked={routePathLink.isStartNodeUsingBookSchedule}
                        content='Ohitusaika kirja-aikataulussa'
                        onClick={this.onCheckboxChange(
                            'isStartNodeUsingBookSchedule',
                            routePathLink.isStartNodeUsingBookSchedule
                        )}
                    />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        disabled={
                            isEditingDisabled ||
                            !routePathLink.isStartNodeUsingBookSchedule
                        }
                        type='number'
                        label='PYSÄKIN SARAKENUMERO KIRJA-AIKATAULUSSA'
                        onChange={this.onRoutePathLinkPropertyChange(
                            'startNodeBookScheduleColumnNumber'
                        )}
                        value={routePathLink.startNodeBookScheduleColumnNumber}
                        validationResult={
                            invalidPropertiesMap[
                                'startNodeBookScheduleColumnNumber'
                            ]
                        }
                    />
                </div>
                <MultiTabTextarea tabs={['Tariffialueet', 'Määränpäät']} />
                <div className={s.flexRow}>
                    <InputContainer
                        disabled={true}
                        label='MUOKANNUT'
                        value={routePathLink.modifiedBy}
                    />
                    <InputContainer
                        disabled={true}
                        type='date'
                        label='MUOKATTU PVM'
                        value={routePathLink.modifiedOn}
                    />
                </div>
            </div>
        );
    };

    private renderNodeView = (node: INode) => {
        return (
            <div className={s.nodeContent}>
                Solmun tiedot
                <div className={s.flexRow}>
                    <TextContainer
                        label='MITTAUSPÄIVÄMÄÄRÄ'
                        value={node.measurementDate}
                    />
                    <TextContainer label='SOLMUN TYYPPI' value={node.type} />
                </div>
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
                    routePathLink.isStartNodeTimeAlignmentStop
                        ? s.timeAlignmentIcon
                        : undefined
                )}
            />
        );

        if (node.type === NodeType.MUNICIPALITY_BORDER) {
            icon = this.addBorder(icon, '#c900ff');
        } else if (node.type === NodeType.DISABLED) {
            icon = this.addBorder(icon, '#353333');
        } else if (node.type === NodeType.STOP) {
            node.transitTypes.forEach(type => {
                icon = this.addBorder(icon, TransitTypeHelper.getColor(type));
            });
        } else if (node.type === NodeType.CROSSROAD) {
            icon = this.addBorder(icon, '#727272');
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
                        Avaa solmu verkkonäkymässä
                        <FiChevronRight />
                    </Button>
                </div>
            </div>
        );
    };

    private openInNetworkView = () => {
        const editNetworkLink = routeBuilder
            .to(SubSites.node)
            .toTarget(this.props.node.id)
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
