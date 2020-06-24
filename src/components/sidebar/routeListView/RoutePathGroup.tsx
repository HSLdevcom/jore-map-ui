import classnames from 'classnames';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import Moment from 'moment';
import React from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import { Button } from '~/components/controls';
import InputContainer from '~/components/controls/InputContainer';
import Loader from '~/components/shared/loader/Loader';
import TransitType from '~/enums/transitType';
import { IRoutePath } from '~/models';
import { IMassEditRoutePath } from '~/models/IRoutePath';
import navigator from '~/routing/navigator';
import routeBuilder from '~/routing/routeBuilder';
import subSites from '~/routing/subSites';
import { RoutePathLayerStore } from '~/stores/routePathLayerStore';
import { RoutePathMassEditStore } from '~/stores/routePathMassEditStore';
import { UserStore } from '~/stores/userStore';
import { isCurrentDateWithinTimeSpan, toDateString } from '~/utils/dateUtils';
import ToggleSwitch from '../../controls/ToggleSwitch';
import { IRoutePathStopNames } from './RoutePathListTab';
import * as s from './routePathGroup.scss';

interface IRoutePathGroupProps {
    routePaths: IRoutePath[];
    nextGroup: IRoutePath[] | null;
    prevGroup: IRoutePath[] | null;
    isEditing: boolean;
    areStopNamesLoading: boolean;
    index: number;
    stopNameMap: Map<string, IRoutePathStopNames>;
    userStore?: UserStore;
    routePathLayerStore?: RoutePathLayerStore;
    routePathMassEditStore?: RoutePathMassEditStore;
}

@inject('userStore', 'routePathLayerStore', 'routePathMassEditStore')
@observer
class RoutePathGroup extends React.Component<IRoutePathGroupProps> {
    private updateStartDates = (routePaths: IRoutePath[]) => async (value: Date) => {
        for (const index in routePaths) {
            const routePath = routePaths[index];
            this.props.routePathMassEditStore!.updateRoutePathStartDate(
                routePath.internalId,
                value
            );
        }
    };

    private updateEndDates = (routePaths: IRoutePath[]) => (value: Date) => {
        routePaths.forEach((rp) => {
            this.props.routePathMassEditStore!.updateRoutePathEndDate(rp.internalId, value);
        });
    };

    private openRoutePathView = (routePath: IRoutePath) => () => {
        const routePathViewLink = routeBuilder
            .to(subSites.routePath)
            .toTarget(
                ':id',
                [
                    routePath.routeId,
                    Moment(routePath.startDate).format('YYYY-MM-DDTHH:mm:ss'),
                    routePath.direction,
                ].join(',')
            )
            .toLink();
        navigator.goTo({ link: routePathViewLink });
    };

    private selectRoutePath = (routePathToSelect: IRoutePath) => (
        event: React.MouseEvent<HTMLElement>
    ) => {
        const routePathMassEditStore = this.props.routePathMassEditStore!;
        const selectedRoutePath = routePathMassEditStore!.selectedRoutePath;
        if (event.ctrlKey || event.shiftKey) {
            if (selectedRoutePath?.internalId === routePathToSelect.internalId) {
                routePathMassEditStore.setSelectedRoutePath(null);
                return;
            }
            if (selectedRoutePath && selectedRoutePath.direction !== routePathToSelect.direction) {
                routePathMassEditStore.addSelectedRoutePathPair([
                    selectedRoutePath,
                    routePathToSelect,
                ]);
                routePathMassEditStore.setSelectedRoutePath(null);
                return;
            }
            routePathMassEditStore.setSelectedRoutePath(routePathToSelect);
        }
    };

    render() {
        const { routePaths, nextGroup, prevGroup, isEditing, index } = this.props;
        const firstRp = routePaths[0];
        const header = `${toDateString(firstRp.startDate)} - ${toDateString(firstRp.endDate)}`;
        let validationResult;
        let minStartDate = undefined;
        let maxEndDate = undefined;
        let isStartDateSet = true;
        let isEndDateSet = true;
        if (isEditing) {
            const currentMassEditRoutePaths = this.props.routePathMassEditStore!.massEditRoutePaths?.filter(
                (massEditRp: IMassEditRoutePath) => {
                    return routePaths.find((rp) => rp.internalId === massEditRp.id);
                }
            );
            // Try to find validationResult with that is invalid (prefered) or has an errorMessage
            let validationResultInvalid;
            let validationResultWithErrorMessage;
            currentMassEditRoutePaths!.forEach((massEditRp: IMassEditRoutePath) => {
                const validationResult = massEditRp.validationResult;
                if (!validationResult.isValid) {
                    validationResultInvalid = validationResult;
                }
                if (!_.isEmpty(validationResult.errorMessage)) {
                    validationResultWithErrorMessage = validationResult;
                }
            });
            validationResult = validationResultInvalid
                ? validationResultInvalid
                : validationResultWithErrorMessage;

            const isOldRoutePathIncluded = Boolean(
                currentMassEditRoutePaths!.find((massEditRp) => !massEditRp.isNew)
            );

            if (isOldRoutePathIncluded) {
                if (prevGroup) {
                    minStartDate = _.cloneDeep(prevGroup[0].endDate);
                    minStartDate.setDate(minStartDate.getDate() + 1);
                }
                if (nextGroup) {
                    maxEndDate = _.cloneDeep(nextGroup[0].startDate);
                    maxEndDate.setDate(maxEndDate.getDate() - 1);
                }
            }
            isStartDateSet = currentMassEditRoutePaths![0]!.isStartDateSet;
            isEndDateSet = currentMassEditRoutePaths![0]!.isEndDateSet;

        }
        // Group's start & end date are the same, thats why you can use firstRp's startDate and endDate
        const startDate = isStartDateSet ? firstRp.startDate : null;
        const endDate = isEndDateSet ? firstRp.endDate : null;
        return (
            <div
                key={`${header}-${index}`}
                className={classnames(s.routePathGroup, index % 2 ? s.shadow : undefined)}
            >
                <div
                    className={classnames(
                        s.dateContainer,
                        !isEditing ? s.editingDisabledDateContainer : undefined
                    )}
                >
                    {isEditing ? (
                        <>
                            <InputContainer
                                label=''
                                disabled={!this.props.isEditing}
                                type='date'
                                value={startDate}
                                onChange={this.updateStartDates(routePaths)}
                                validationResult={validationResult}
                                minStartDate={minStartDate}
                                maxEndDate={maxEndDate}
                            />
                            <InputContainer
                                label=''
                                disabled={!this.props.isEditing}
                                type='date'
                                value={endDate}
                                onChange={this.updateEndDates(routePaths)}
                                minStartDate={minStartDate}
                                maxEndDate={maxEndDate}
                            />
                        </>
                    ) : (
                        <div>{header}</div>
                    )}
                </div>
                <div>
                    {routePaths.map((routePath: IRoutePath) => {
                        const shouldHighlightRoutePath = isCurrentDateWithinTimeSpan(
                            routePath.startDate,
                            routePath.endDate
                        );
                        const stopNames = this.props.stopNameMap.get(routePath.internalId);
                        const isLoading = !stopNames && this.props.areStopNamesLoading;
                        const stopOriginFi = stopNames?.firstStopName
                            ? stopNames.firstStopName
                            : '-';
                        const stopDestinationFi = stopNames?.lastStopName
                            ? stopNames?.lastStopName
                            : '-';
                        const stopDestinations = `${stopOriginFi} - ${stopDestinationFi}`;
                        const routePathDestinations = `${routePath.originFi} - ${routePath.destinationFi}`;
                        const massEditRp = this.props.routePathMassEditStore!.massEditRoutePaths?.find(
                            (m) => m.routePath.internalId === routePath.internalId
                        )!;
                        const isNew = massEditRp && massEditRp.isNew;
                        const isSelected =
                            this.props.routePathMassEditStore!.selectedRoutePath?.internalId ===
                            routePath.internalId;
                        const oldRoutePath = massEditRp && massEditRp.oldRoutePath;
                        const rpFromRpLayerStore = this.props.routePathLayerStore!.getRoutePath(
                            routePath.internalId
                        );
                        const isVisible = rpFromRpLayerStore
                            ? Boolean(rpFromRpLayerStore.isVisible)
                            : false;
                        const color =
                            rpFromRpLayerStore && rpFromRpLayerStore.color
                                ? rpFromRpLayerStore.color
                                : '#898989';
                        const destinations1 =
                            this.props.userStore!.userTransitType === TransitType.BUS
                                ? routePathDestinations
                                : stopDestinations;
                        const destinations2 =
                            this.props.userStore!.userTransitType === TransitType.BUS
                                ? stopDestinations
                                : routePathDestinations;
                        return (
                            <div
                                className={classnames(
                                    s.routePath,
                                    isEditing && isNew ? s.highlighAsNew : undefined,
                                    isSelected ? s.highlightAsSelected : undefined
                                )}
                                onClick={isNew ? this.selectRoutePath(routePath) : void 0}
                                key={routePath.internalId}
                            >
                                <div
                                    className={classnames(
                                        isEditing
                                            ? s.routePathInfoEditing
                                            : s.routePathInfoNotEditing,
                                        shouldHighlightRoutePath
                                            ? s.routePathHighlighted
                                            : undefined
                                    )}
                                    onClick={isEditing ? void 0 : this.openRoutePathView(routePath)}
                                    title={
                                        isNew && oldRoutePath
                                            ? `Kopioitu reitinsuunta: ${
                                                  oldRoutePath.direction
                                              } | ${toDateString(
                                                  oldRoutePath.startDate
                                              )} - ${toDateString(oldRoutePath.endDate)} | ${
                                                  oldRoutePath.originFi
                                              } - ${oldRoutePath.destinationFi} | ${
                                                  oldRoutePath.lineId
                                              } | ${oldRoutePath.routeId}`
                                            : isEditing
                                            ? ``
                                            : `Avaa reitinsuunta ${destinations1} - ${destinations2}`
                                    }
                                    data-cy='openRoutePathViewButton'
                                >
                                    <div className={s.routePathDirection}>
                                        {routePath.direction}
                                    </div>
                                    <div>
                                        {isLoading ? (
                                            <Loader
                                                containerClassName={s.stopNameLoader}
                                                size='tiny'
                                                hasNoMargin={true}
                                            />
                                        ) : (
                                            <>
                                                <div className={s.destinations1}>
                                                    {destinations1}
                                                </div>
                                                <div className={s.destinations2}>
                                                    {destinations2}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className={s.routePathControls}>
                                    {isEditing && isNew && (
                                        <Button
                                            className={s.removeNewRoutePathButton}
                                            hasReverseColor={true}
                                            onClick={() =>
                                                this.props.routePathMassEditStore!.removeRoutePath(
                                                    routePath.internalId
                                                )
                                            }
                                        >
                                            <FaTrashAlt />
                                        </Button>
                                    )}
                                    <ToggleSwitch
                                        onClick={() =>
                                            this.props.routePathLayerStore!.toggleRoutePathVisibility(
                                                routePath.internalId
                                            )
                                        }
                                        value={isVisible}
                                        color={color}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
}

export default RoutePathGroup;
