import classnames from 'classnames';
import * as L from 'leaflet';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useRef } from 'react';
import { FaAngleDown, FaAngleRight } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import { Button, Checkbox } from '~/components/controls';
import Dropdown from '~/components/controls/Dropdown';
import InputContainer from '~/components/controls/InputContainer';
import TextContainer from '~/components/controls/TextContainer';
import { getNeighborLinkColor } from '~/components/map/layers/edit/RoutePathNeighborLinkLayer';
import TransitTypeNodeIcon from '~/components/shared/TransitTypeNodeIcon';
import ButtonType from '~/enums/buttonType';
import NodeType from '~/enums/nodeType';
import StartNodeType from '~/enums/startNodeType';
import ToolbarToolType from '~/enums/toolbarToolType';
import EventListener, { IRoutePathNodeClickParams } from '~/helpers/EventListener';
import { INeighborLink, INode, IRoutePathLink, IStop } from '~/models';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import { CodeListStore } from '~/stores/codeListStore';
import { ErrorStore } from '~/stores/errorStore';
import { MapStore } from '~/stores/mapStore';
import { RoutePathLayerStore } from '~/stores/routePathLayerStore';
import { RoutePathLinkMassEditStore } from '~/stores/routePathLinkMassEditStore';
import { RoutePathStore } from '~/stores/routePathStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import NodeUtils from '~/utils/NodeUtils';
import * as s from './routePathListItem.scss';

interface IRoutePathListNodeProps {
    node: INode;
    routePathLink: IRoutePathLink;
    isEditingDisabled: boolean;
    isLastNode?: boolean;
    isFirstNode?: boolean;
    isHighlightedByTool: boolean;
    isExtended: boolean;
    isHovered: boolean;
    isStartNodeUsingBookSchedule?: boolean;
    startNodeBookScheduleColumnNumber?: number | null;
    selectedRoutePathLinkIndex: number;
    isNeighborLinkHighlighted: boolean;
    upperGapClosingNeighborLink: INeighborLink | null;
    bottomGapClosingNeighborLink: INeighborLink | null;
    routePathStore?: RoutePathStore;
    routePathLayerStore?: RoutePathLayerStore;
    routePathLinkMassEditStore?: RoutePathLinkMassEditStore;
    mapStore?: MapStore;
    toolbarStore?: ToolbarStore;
    errorStore?: ErrorStore;
    codeListStore?: CodeListStore;
}

const ROUTE_PATH_TOOLS = [
    ToolbarToolType.ExtendRoutePath,
    ToolbarToolType.RemoveRoutePathLink,
    ToolbarToolType.CopyRoutePathSegment,
];

const RoutePathListNode = inject(
    'routePathStore',
    'routePathLayerStore',
    'routePathLinkMassEditStore',
    'errorStore',
    'mapStore',
    'toolbarStore',
    'codeListStore'
)(
    observer(
        React.forwardRef((props: IRoutePathListNodeProps, ref: React.RefObject<HTMLDivElement>) => {
            const isExtendedRef = useRef(props.isExtended);
            isExtendedRef.current = props.isExtended;
            useEffect(() => {
                EventListener.on('routePathNodeClick', onRoutePathNodeClick);
                return () => {
                    EventListener.off('routePathNodeClick', onRoutePathNodeClick);
                };
            }, []);

            const renderHeader = () => {
                const node = props.node;
                const routePathLink = props.routePathLink;
                const stopName = node.stop ? node.stop.nameFi : '';
                const isExtended = props.isExtended;
                const nodeTypeName = NodeUtils.getNodeTypeName(node.type);
                const shortId = NodeUtils.getShortId(node);
                const subTopic = node.type === NodeType.STOP ? stopName : nodeTypeName;
                const isLastNode = props.isLastNode;
                const isNodeDisabled = routePathLink.startNodeType === StartNodeType.DISABLED;
                return (
                    <div
                        className={classnames(s.itemHeader, isNodeDisabled ? s.opacity : undefined)}
                    >
                        <div
                            className={s.headerContent}
                            onClick={onClickNodeItem}
                            onMouseEnter={onMouseEnterNodeItem}
                            onMouseLeave={onMouseLeaveNodeItem}
                            data-cy='itemHeader'
                        >
                            <div className={s.headerContainer} title={subTopic}>
                                {subTopic}
                            </div>
                            <div
                                className={classnames(
                                    s.hastusId,
                                    isLastNode ||
                                        isNodeDisabled ||
                                        routePathLink.isStartNodeHastusStop
                                        ? undefined
                                        : s.opacity
                                )}
                            >
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
                        </div>
                        <div className={s.itemToggle} onClick={toggleExtendedListItem}>
                            {isExtended && <FaAngleDown />}
                            {!isExtended && <FaAngleRight />}
                        </div>
                    </div>
                );
            };

            const isNodeSelected = () => {
                return (
                    !props.isLastNode &&
                    props.node.type === NodeType.STOP &&
                    props.selectedRoutePathLinkIndex > -1
                );
            };

            const onClickNodeItem = (event: React.MouseEvent) => {
                const clickParams: IRoutePathNodeClickParams = {
                    node: props.node,
                    linkOrderNumber: props.routePathLink.orderNumber,
                    isCtrlOrShiftPressed: Boolean(event.ctrlKey) || Boolean(event.shiftKey),
                };
                EventListener.trigger('routePathNodeClick', clickParams);
            };

            // React to routePathClick via event (to support listening click events from the map)
            const onRoutePathNodeClick = (clickEvent: CustomEvent) => {
                const selectedTool = props.toolbarStore!.selectedTool;
                // Action depends on whether a routePathTool is selected or not
                if (selectedTool && ROUTE_PATH_TOOLS.includes(selectedTool.toolType)) {
                    return;
                }
                const clickParams: IRoutePathNodeClickParams = clickEvent.detail;

                if (clickParams.node.internalId !== props.node.internalId) {
                    return;
                }

                const isCtrlOrShiftPressed = clickParams.isCtrlOrShiftPressed;
                // Mass edit routePathLinks toggle
                if (
                    !props.isLastNode &&
                    props.node.type === NodeType.STOP &&
                    isCtrlOrShiftPressed
                ) {
                    const selectedTool = props.toolbarStore!.selectedTool;
                    if (
                        selectedTool &&
                        selectedTool.toolType !== ToolbarToolType.SelectNetworkEntity
                    ) {
                        props.errorStore!.addError(
                            `Pysäkkien massa editointi editointi estetty, sulje ensin aktiivinen karttatyökalu.`
                        );
                        return;
                    }
                    props.routePathStore!.setIsEditingDisabled(false);
                    props.routePathLinkMassEditStore!.toggleSelectedRoutePathLink(
                        props.routePathLink
                    );
                    // List item toggle
                } else {
                    toggleExtendedListItem();
                }
            };

            const toggleExtendedListItem = () => {
                const currentListItemId = props.node.internalId;
                const isExtended = isExtendedRef.current;
                if (isExtended) {
                    props.routePathLayerStore!.setExtendedListItemId(null);
                } else {
                    props.routePathLayerStore!.setExtendedListItemId(currentListItemId);
                    const geometry = props.routePathStore!.getLinkGeom(routePathLink.id);
                    const bounds: L.LatLngBounds = new L.LatLngBounds([]);
                    geometry.forEach((geom: L.LatLng) => bounds.extend(geom));
                    props.mapStore!.setMapBounds(bounds);
                }
            };

            const onRoutePathLinkStartNodeTypeChange = () => (value: any) => {
                onRoutePathLinkPropertyChange('startNodeType')(value ? 'E' : 'P');
            };

            const onRoutePathLinkPropertyChange = (property: keyof IRoutePathLink) => (
                value: any
            ) => {
                const orderNumber = props.routePathLink.orderNumber;
                props.routePathStore!.updateRoutePathLinkProperty(orderNumber, property, value);
            };

            /**
             * A special onChange function for the following properties:
             * isStartNodeUsingBookSchedule & startNodeBookScheduleColumnNumber
             * note: the last rpLink link will change routePath's value instead of routePathLink's value
             */
            const onRoutePathBookSchedulePropertyChange = (
                property: 'startNodeBookScheduleColumnNumber' | 'isStartNodeUsingBookSchedule'
            ) => (value: any) => {
                const orderNumber = props.routePathLink.orderNumber;

                if (props.isLastNode) {
                    props.routePathStore!.updateRoutePathProperty(property, value);
                } else {
                    props.routePathStore!.updateRoutePathLinkProperty(orderNumber, property, value);
                }
            };

            const onIsStartNodeUsingBookScheduleChange = (value: boolean) => () => {
                onRoutePathBookSchedulePropertyChange('isStartNodeUsingBookSchedule')(value);
                // When changing isStartNodeUsingBookSchedule as false, we want to clear input of startNodeBookScheduleColumnNumber
                if (!value) {
                    onRoutePathBookSchedulePropertyChange('startNodeBookScheduleColumnNumber')('');
                }
            };

            const renderStopView = (stop: IStop) => {
                const isEditingDisabled = props.isEditingDisabled;
                const routePathLink = props.routePathLink;
                const isStartNodeUsingBookSchedule = props.isStartNodeUsingBookSchedule;
                const startNodeBookScheduleColumnNumber = props.startNodeBookScheduleColumnNumber;
                const invalidPropertiesMap = props.routePathStore!.getRoutePathLinkInvalidPropertiesMap(
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
                        {!props.isLastNode && (
                            <>
                                <div className={s.flexRow}>
                                    <Checkbox
                                        disabled={isEditingDisabled}
                                        content='Pysäkki ei käytössä'
                                        checked={
                                            routePathLink.startNodeType === StartNodeType.DISABLED
                                        }
                                        onClick={onRoutePathLinkStartNodeTypeChange()}
                                    />
                                </div>
                                <div className={s.flexRow}>
                                    <Checkbox
                                        disabled={isEditingDisabled}
                                        checked={Boolean(routePathLink.isStartNodeHastusStop)}
                                        content='Hastus paikka'
                                        onClick={onRoutePathLinkPropertyChange(
                                            'isStartNodeHastusStop'
                                        )}
                                    />
                                </div>
                                <div className={s.flexRow}>
                                    <Dropdown
                                        label='AJANTASAUSPYSÄKKI'
                                        onChange={onRoutePathLinkPropertyChange(
                                            'startNodeTimeAlignmentStop'
                                        )}
                                        disabled={isEditingDisabled}
                                        selected={routePathLink.startNodeTimeAlignmentStop}
                                        items={props.codeListStore!.getDropdownItemList(
                                            'Ajantasaus pysakki'
                                        )}
                                        isInputLabelDarker={true}
                                    />
                                    <Dropdown
                                        label='ERIKOISTYYPPI'
                                        onChange={onRoutePathLinkPropertyChange('startNodeUsage')}
                                        disabled={isEditingDisabled}
                                        selected={routePathLink.startNodeUsage}
                                        items={props.codeListStore!.getDropdownItemList(
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
                                        onChange={onRoutePathLinkPropertyChange('destinationFi1')}
                                        isInputLabelDarker={true}
                                        data-cy='destinationFi1'
                                    />
                                    <InputContainer
                                        label='2. MÄÄRÄNPÄÄ SUOMEKSI'
                                        disabled={isEditingDisabled}
                                        value={routePathLink.destinationFi2}
                                        validationResult={invalidPropertiesMap['destinationFi2']}
                                        onChange={onRoutePathLinkPropertyChange('destinationFi2')}
                                        isInputLabelDarker={true}
                                    />
                                </div>
                                <div className={s.flexRow}>
                                    <InputContainer
                                        label='1. MÄÄRÄNPÄÄ RUOTSIKSI'
                                        disabled={isEditingDisabled}
                                        value={routePathLink.destinationSw1}
                                        validationResult={invalidPropertiesMap['destinationSw1']}
                                        onChange={onRoutePathLinkPropertyChange('destinationSw1')}
                                        isInputLabelDarker={true}
                                    />
                                    <InputContainer
                                        label='2. MÄÄRÄNPÄÄ RUOTSIKSI'
                                        disabled={isEditingDisabled}
                                        value={routePathLink.destinationSw2}
                                        validationResult={invalidPropertiesMap['destinationSw2']}
                                        onChange={onRoutePathLinkPropertyChange('destinationSw2')}
                                        isInputLabelDarker={true}
                                    />
                                </div>
                                <div className={s.flexRow}>
                                    <InputContainer
                                        label='1. MÄÄRÄNPÄÄ KILPI SUOMEKSI'
                                        disabled={isEditingDisabled}
                                        value={routePathLink.destinationShieldFi}
                                        validationResult={
                                            invalidPropertiesMap['destinationShieldFi']
                                        }
                                        onChange={onRoutePathLinkPropertyChange(
                                            'destinationShieldFi'
                                        )}
                                        isInputLabelDarker={true}
                                        data-cy='destinationShieldFi'
                                    />
                                    <InputContainer
                                        label='2. MÄÄRÄNPÄÄ KILPI RUOTSIKSI'
                                        disabled={isEditingDisabled}
                                        value={routePathLink.destinationShieldSw}
                                        validationResult={
                                            invalidPropertiesMap['destinationShieldSw']
                                        }
                                        onChange={onRoutePathLinkPropertyChange(
                                            'destinationShieldSw'
                                        )}
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
                                onClick={onIsStartNodeUsingBookScheduleChange(
                                    !isStartNodeUsingBookSchedule
                                )}
                            />
                        </div>
                        <div className={s.flexRow}>
                            <InputContainer
                                disabled={isEditingDisabled || !isStartNodeUsingBookSchedule}
                                type='number'
                                label='PYSÄKIN SARAKENUMERO KIRJA-AIKATAULUSSA'
                                onChange={onRoutePathBookSchedulePropertyChange(
                                    'startNodeBookScheduleColumnNumber'
                                )}
                                value={startNodeBookScheduleColumnNumber}
                                validationResult={
                                    invalidPropertiesMap['startNodeBookScheduleColumnNumber']
                                }
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

            const renderNodeView = (node: INode) => {
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

            const renderBody = () => {
                const node = props.node;
                return (
                    <>
                        {Boolean(node.stop) && renderStopView(node.stop!)}
                        {renderNodeView(node)}
                        <div className={s.footer}>
                            <Button
                                onClick={() => openNodeInNewTab(node.id)}
                                type={ButtonType.SQUARE}
                            >
                                <div>Avaa solmu</div>
                                <FiExternalLink />
                            </Button>
                        </div>
                    </>
                );
            };

            const openNodeInNewTab = (nodeId: string) => {
                const nodeViewLink = routeBuilder
                    .to(SubSites.node)
                    .toTarget(':id', nodeId)
                    .toLink();
                window.open(nodeViewLink, '_blank');
            };

            const getShadowClass = () => {
                let shadowClass;
                if (props.node!.stop) {
                    shadowClass = s.shadowStop;
                } else {
                    shadowClass = s.shadow;
                }
                return shadowClass;
            };

            const onMouseEnterNodeItem = () => {
                props.routePathLayerStore!.setHoveredItemId(props.node.internalId);
            };

            const onMouseLeaveNodeItem = () => {
                if (props.isHovered) {
                    props.routePathLayerStore!.setHoveredItemId(null);
                }
            };

            const { node, routePathLink, isFirstNode, isLastNode } = props;
            const isHighlightedByTool = props.isHighlightedByTool;
            const isExtended = props.isExtended;
            const isHovered = props.isHovered;
            const isHighlighted = isHighlightedByTool || isExtended || isHovered;
            const highlightColor = isHovered
                ? 'yellow'
                : isHighlightedByTool
                ? 'green'
                : isExtended
                ? 'blue'
                : undefined;

            return (
                <div
                    ref={ref}
                    className={classnames(
                        s.routePathListItem,
                        getShadowClass(),
                        isNodeSelected() ? s.highlightedItem : undefined
                    )}
                >
                    <div
                        className={s.listIconWrapper}
                        onMouseEnter={onMouseEnterNodeItem}
                        onMouseLeave={onMouseLeaveNodeItem}
                        onClick={onClickNodeItem}
                    >
                        <div className={s.borderContainer}>
                            <div
                                className={
                                    !isFirstNode
                                        ? s.borderLeft
                                        : props.upperGapClosingNeighborLink
                                        ? s.neighborBorderLeft
                                        : undefined
                                }
                                style={{
                                    borderColor: props.upperGapClosingNeighborLink
                                        ? getNeighborLinkColor(
                                              props.upperGapClosingNeighborLink,
                                              props.isNeighborLinkHighlighted
                                          )
                                        : undefined,
                                }}
                            />
                            <div />
                        </div>
                        <div className={s.listIcon} data-cy='rpListNode'>
                            <TransitTypeNodeIcon
                                nodeType={node.type}
                                transitTypes={node.transitTypes}
                                isTimeAlignmentStop={
                                    !isLastNode && routePathLink.startNodeTimeAlignmentStop !== '0'
                                }
                                isDisabled={
                                    !isLastNode &&
                                    routePathLink.startNodeType === StartNodeType.DISABLED
                                }
                                isHighlighted={isHighlighted}
                                highlightColor={highlightColor}
                            />
                        </div>
                        <div className={s.borderContainer}>
                            <div
                                className={
                                    !isLastNode
                                        ? s.borderLeft
                                        : props.bottomGapClosingNeighborLink
                                        ? s.neighborBorderLeft
                                        : undefined
                                }
                                style={{
                                    borderColor: props.bottomGapClosingNeighborLink
                                        ? getNeighborLinkColor(
                                              props.bottomGapClosingNeighborLink,
                                              props.isNeighborLinkHighlighted
                                          )
                                        : undefined,
                                }}
                            />
                            <div />
                        </div>
                    </div>
                    <div className={s.contentWrapper}>
                        {renderHeader()}
                        {isExtended && <div className={s.itemContent}>{renderBody()}</div>}
                    </div>
                </div>
            );
        })
    )
);

export default RoutePathListNode;
