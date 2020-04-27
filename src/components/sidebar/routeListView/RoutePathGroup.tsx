import classnames from 'classnames';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import Moment from 'moment';
import React from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import { FiInfo } from 'react-icons/fi';
import { Button } from '~/components/controls';
import InputContainer from '~/components/controls/InputContainer';
import Loader from '~/components/shared/loader/Loader';
import TransitType from '~/enums/transitType';
import { IRoutePath } from '~/models';
import navigator from '~/routing/navigator';
import routeBuilder from '~/routing/routeBuilder';
import subSites from '~/routing/subSites';
import { RouteListStore } from '~/stores/routeListStore';
import { RoutePathMassEditStore } from '~/stores/routePathMassEditStore';
import { UserStore } from '~/stores/userStore';
import { toDateString } from '~/utils/dateUtils';
import ToggleSwitch from '../../controls/ToggleSwitch';
import { IRoutePathStopNames } from './RoutePathListTab';
import * as s from './routePathListTab.scss';

interface IRoutePathGroupProps {
    routePaths: IRoutePath[];
    nextGroup: IRoutePath[] | null;
    prevGroup: IRoutePath[] | null;
    isEditing: boolean;
    areStopNamesLoading: boolean;
    index: number;
    stopNameMap: Map<string, IRoutePathStopNames>;
    removeNewRoutePath: (id: string) => () => void;
    userStore?: UserStore;
    routeListStore?: RouteListStore;
    routePathMassEditStore?: RoutePathMassEditStore;
}

@inject('userStore', 'routeListStore', 'routePathMassEditStore')
@observer
class RoutePathGroup extends React.Component<IRoutePathGroupProps> {
    private updateStartDates = (routePaths: IRoutePath[]) => (value: Date) => {
        routePaths.forEach((rp) => {
            this.props.routePathMassEditStore!.updateRoutePathStartDate(rp.internalId, value);
        });
    };

    private updateEndDates = (routePaths: IRoutePath[]) => (value: Date) => {
        routePaths.forEach((rp) => {
            this.props.routePathMassEditStore!.updateRoutePathEndDate(rp.internalId, value);
        });
    };

    private toggleRoutePathVisibility = (id: string) => () => {
        this.props.routeListStore!.toggleRoutePathVisibility(id);
    };

    private openRoutePathView = (routePath: IRoutePath) => () => {
        const routePathViewLink = routeBuilder
            .to(subSites.routePath)
            .toTarget(
                ':id',
                [
                    routePath.routeId,
                    Moment(routePath.startTime).format('YYYY-MM-DDTHH:mm:ss'),
                    routePath.direction,
                ].join(',')
            )
            .toLink();
        navigator.goTo({ link: routePathViewLink });
    };

    render() {
        const { routePaths, nextGroup, prevGroup, index } = this.props;
        let minStartDate = undefined;
        let maxEndDate = undefined;
        if (prevGroup) {
            minStartDate = _.cloneDeep(prevGroup[0].endTime);
            minStartDate.setDate(minStartDate.getDate() + 1);
        }
        if (nextGroup) {
            maxEndDate = _.cloneDeep(nextGroup[0].startTime);
            maxEndDate.setDate(maxEndDate.getDate() - 1);
        }
        const isEditing = this.props.isEditing;
        const first = routePaths[0];
        const header = `${toDateString(first.startTime)} - ${toDateString(first.endTime)}`;
        let validationResult;
        if (isEditing) {
            validationResult = this.props.routePathMassEditStore!.massEditRoutePaths?.find(
                (m) => m.routePath.internalId === first.internalId
            )?.validationResult;
        }
        return (
            <div
                key={header}
                className={classnames(s.groupedRoutes, index % 2 ? s.shadow : undefined)}
            >
                <div className={s.groupedRoutesDates}>
                    {isEditing ? (
                        <>
                            <InputContainer
                                label=''
                                disabled={!this.props.isEditing}
                                type='date'
                                value={first.startTime}
                                onChange={this.updateStartDates(routePaths)}
                                validationResult={validationResult}
                                minStartDate={minStartDate}
                                maxEndDate={maxEndDate}
                            />
                            <InputContainer
                                label=''
                                disabled={!this.props.isEditing}
                                type='date'
                                value={first.endTime}
                                onChange={this.updateEndDates(routePaths)}
                                minStartDate={minStartDate}
                                maxEndDate={maxEndDate}
                            />
                        </>
                    ) : (
                        <div>{header}</div>
                    )}
                </div>
                <div className={s.groupedRoutesContent}>
                    {routePaths.map((routePath: IRoutePath) => {
                        const shouldHighlightRoutePath = _isCurrentTimeWithinRoutePathTimeSpan(
                            routePath
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
                        const isEditing = this.props.isEditing;
                        const massEditRp = this.props.routePathMassEditStore!.massEditRoutePaths?.find(
                            (m) => m.routePath.internalId === routePath.internalId
                        )!;
                        return (
                            <div
                                className={classnames(
                                    s.routePathContainer,
                                    isEditing && massEditRp.isNew ? s.highlighAsNew : undefined
                                )}
                                key={routePath.internalId}
                            >
                                <div
                                    className={
                                        shouldHighlightRoutePath
                                            ? classnames(s.routePathInfo, s.highlight)
                                            : s.routePathInfo
                                    }
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
                                                    {this.props.userStore!.userTransitType ===
                                                    TransitType.BUS
                                                        ? routePathDestinations
                                                        : stopDestinations}
                                                </div>
                                                <div className={s.destinations2}>
                                                    {this.props.userStore!.userTransitType ===
                                                    TransitType.BUS
                                                        ? stopDestinations
                                                        : routePathDestinations}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className={s.routePathControls}>
                                    {isEditing && massEditRp.isNew && (
                                        <Button
                                            className={s.removeNewRoutePathButton}
                                            hasReverseColor={true}
                                            onClick={this.props.removeNewRoutePath(
                                                routePath.internalId
                                            )}
                                        >
                                            <FaTrashAlt />
                                        </Button>
                                    )}
                                    <Button
                                        className={s.openRoutePathViewButton}
                                        hasReverseColor={true}
                                        onClick={this.openRoutePathView(routePath)}
                                        data-cy='openRoutePathViewButton'
                                    >
                                        <FiInfo />
                                    </Button>
                                    <ToggleSwitch
                                        onClick={this.toggleRoutePathVisibility(
                                            routePath.internalId
                                        )}
                                        value={routePath.visible}
                                        color={routePath.visible ? routePath.color! : '#898989'}
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

const _isCurrentTimeWithinRoutePathTimeSpan = (routePath: IRoutePath) => {
    return (
        Moment(routePath.startTime).isBefore(Moment()) &&
        Moment(routePath.endTime).isAfter(Moment())
    );
};

export default RoutePathGroup;
