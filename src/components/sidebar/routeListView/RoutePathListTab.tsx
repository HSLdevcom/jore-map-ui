import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import Moment from 'moment';
import React from 'react';
import SavePrompt, { ISaveModel } from '~/components/overlays/SavePrompt';
import SaveButton from '~/components/shared/SaveButton';
import { IRoutePath } from '~/models';
import RoutePathMassEditService from '~/services/routePathMassEditService';
import RoutePathService from '~/services/routePathService';
import { AlertStore } from '~/stores/alertStore';
import { ConfirmStore } from '~/stores/confirmStore';
import { ErrorStore } from '~/stores/errorStore';
import { LoginStore } from '~/stores/loginStore';
import { MapStore } from '~/stores/mapStore';
import { RouteListStore } from '~/stores/routeListStore';
import { RoutePathMassEditStore } from '~/stores/routePathMassEditStore';
import RoutePathGroup from './RoutePathGroup';
import * as s from './routePathListTab.scss';

interface IRoutePathStopNames {
    firstStopName: string;
    lastStopName: string;
}

interface IRoutePathListTabProps {
    routePaths: IRoutePath[];
    isEditing: boolean;
    areAllRoutePathsVisible: boolean;
    toggleAllRoutePathsVisible: () => void;
    routeListStore?: RouteListStore;
    mapStore?: MapStore;
    confirmStore?: ConfirmStore;
    loginStore?: LoginStore;
    alertStore?: AlertStore;
    errorStore?: ErrorStore;
    routePathMassEditStore?: RoutePathMassEditStore;
}

interface IRoutePathListTabState {
    stopNameMap: Map<string, IRoutePathStopNames>;
    areStopNamesLoading: boolean;
    allGroupedRoutePaths: IRoutePath[][];
    groupedRoutePathsToDisplay: IRoutePath[][];
}

const ROUTE_PATH_GROUP_SHOW_LIMIT = 3;

@inject(
    'routeListStore',
    'mapStore',
    'confirmStore',
    'loginStore',
    'alertStore',
    'errorStore',
    'routePathMassEditStore'
)
@observer
class RoutePathListTab extends React.Component<IRoutePathListTabProps, IRoutePathListTabState> {
    private _isMounted: boolean;
    constructor(props: IRoutePathListTabProps) {
        super(props);
        this.state = {
            stopNameMap: new Map(),
            areStopNamesLoading: true,
            allGroupedRoutePaths: [],
            groupedRoutePathsToDisplay: [],
        };
    }

    private _setState = (newState: object) => {
        if (this._isMounted) {
            this.setState(newState);
        }
    };

    componentWillMount() {
        this._isMounted = true;
        this.updateGroupedRoutePathsToDisplay(this.props.routePaths);
    }

    componentDidUpdate(prevProps: IRoutePathListTabProps) {
        if (
            prevProps.areAllRoutePathsVisible !== this.props.areAllRoutePathsVisible ||
            !_.isEqual(prevProps.routePaths, this.props.routePaths)
        ) {
            this.updateGroupedRoutePathsToDisplay(this.props.routePaths);
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    private updateGroupedRoutePathsToDisplay = (routePaths: IRoutePath[]) => {
        const allGroupedRoutePaths: IRoutePath[][] = this.groupRoutePathsOnDates(routePaths);
        const groupedRoutePathsToDisplay = this.props.areAllRoutePathsVisible
            ? allGroupedRoutePaths
            : allGroupedRoutePaths.slice(0, ROUTE_PATH_GROUP_SHOW_LIMIT);
        this.fetchStopNames(groupedRoutePathsToDisplay);
        this._setState({
            allGroupedRoutePaths,
            groupedRoutePathsToDisplay,
        });
        this.setRoutePathsVisible(groupedRoutePathsToDisplay);
    };

    private groupRoutePathsOnDates = (routePaths: IRoutePath[]): IRoutePath[][] => {
        const res = {};
        routePaths.forEach((rp) => {
            const identifier = rp.startTime.toLocaleDateString() + rp.endTime.toLocaleDateString();
            (res[identifier] = res[identifier] || []).push(rp);
        });

        const list: IRoutePath[][] = Object.values(res);
        list.sort(
            (a: IRoutePath[], b: IRoutePath[]) =>
                b[0].startTime.getTime() - a[0].startTime.getTime()
        );
        list.forEach((routePaths: IRoutePath[]) => {
            routePaths.sort((a: IRoutePath, b: IRoutePath) => (a.direction === '1' ? -1 : 1));
        });
        return list;
    };

    private fetchStopNames = async (groupedRoutePathsToDisplay: IRoutePath[][]) => {
        const stopNameMap = this.state.stopNameMap;
        this._setState({
            areStopNamesLoading: true,
        });
        const promises: Promise<void>[] = [];
        for (const routePaths of groupedRoutePathsToDisplay) {
            for (let i = 0; i < routePaths.length; i += 1) {
                const routePath: IRoutePath = routePaths[i];
                const oldStopNames = stopNameMap.get(routePath.internalId);
                if (!oldStopNames) {
                    const createPromise = async () => {
                        let direction = routePath.direction;
                        let startTime = routePath.startTime;
                        if (this.props.isEditing) {
                            // Have to use old routePath's data for querying, current routePath's data might have changed
                            const oldRoutePath = this.props.routePathMassEditStore!.massEditRoutePaths?.find(
                                (rp) => rp.id === routePath.internalId
                            )!.oldRoutePath!;
                            direction = oldRoutePath.direction;
                            startTime = oldRoutePath.startTime;
                        }
                        const stopNames = await RoutePathService.fetchFirstAndLastStopNamesOfRoutePath(
                            {
                                direction,
                                startTime,
                                routeId: routePath.routeId,
                            }
                        );
                        stopNameMap.set(routePath.internalId, stopNames as IRoutePathStopNames);
                    };
                    promises.push(createPromise());
                }
            }
        }

        Promise.all(promises).then(() => {
            this._setState({
                stopNameMap,
                areStopNamesLoading: false,
            });
        });
    };

    private setRoutePathsVisible = (groupedRoutePathsToDisplay: IRoutePath[][]) => {
        let isAnyRoutePathVisible = false;
        groupedRoutePathsToDisplay.forEach((groupedRoutePaths: IRoutePath[]) => {
            groupedRoutePaths.forEach((routePath: IRoutePath) => {
                if (routePath.visible) {
                    isAnyRoutePathVisible = true;
                }
            });
        });
        if (!isAnyRoutePathVisible) {
            groupedRoutePathsToDisplay.forEach((groupedRoutePaths: IRoutePath[]) => {
                groupedRoutePaths.forEach((routePath: IRoutePath) => {
                    if (this.isCurrentTimeWithinRoutePathTimeSpan(routePath)) {
                        this.props.routeListStore!.setRoutePathVisibility(
                            true,
                            routePath.internalId
                        );
                    }
                });
            });
        }
    };

    private isCurrentTimeWithinRoutePathTimeSpan = (routePath: IRoutePath) => {
        return (
            Moment(routePath.startTime).isBefore(Moment()) &&
            Moment(routePath.endTime).isAfter(Moment())
        );
    };

    private showSavePrompt = () => {
        const confirmStore = this.props.confirmStore;
        const saveModels: ISaveModel[] = [];
        this.props.routePathMassEditStore!.massEditRoutePaths!.forEach((massEditRp) => {
            saveModels.push({
                type: 'saveModel',
                newData: massEditRp.routePath,
                oldData: massEditRp.oldRoutePath ? massEditRp.oldRoutePath : {},
                subTopic: `${massEditRp.routePath.originFi} - ${massEditRp.routePath.destinationFi}`,
                model: 'routePath',
            });
        });
        confirmStore!.openConfirm({
            content: <SavePrompt models={saveModels} />,
            onConfirm: () => {
                this.save();
            },
        });
    };

    private save = async () => {
        this._setState({ isLoading: true });

        try {
            await RoutePathMassEditService.massEditRoutePaths(
                this.props.routePathMassEditStore!.massEditRoutePaths!
            );
            this.props.routePathMassEditStore!.clear();
            // TODO: clear & fetch routePaths
            this.props.alertStore!.setFadeMessage({ message: 'Tallennettu!' });
        } catch (e) {
            this.props.errorStore!.addError(`Tallennus epäonnistui`, e);
        }
        this.props.routeListStore!.setRouteIdToEdit(null);
    };

    private removeNewRoutePath = (id: string) => () => {
        this.props.routePathMassEditStore!.removeRoutePath(id);
        // Remove routePath also from current props because routePaths in state doesn't get updated otherwise
        const routePaths = _.cloneDeep(this.props.routePaths);
        const removeIndex = routePaths.findIndex((rp) => rp.internalId === id);
        routePaths.splice(removeIndex, 1);
        this.updateGroupedRoutePathsToDisplay(routePaths);
    };

    render() {
        const { routePaths, isEditing } = this.props;
        if (routePaths.length === 0) {
            return (
                <div className={s.routePathListTab}>
                    <div className={s.noRoutePathsMessage}>Reitillä ei ole reitinsuuntia.</div>
                </div>
            );
        }
        const groupedRoutePathsToDisplay = this.state.groupedRoutePathsToDisplay;
        const allGroupedRoutePaths = this.state.allGroupedRoutePaths;
        const isSaveButtonDisabled =
            !this.props.routePathMassEditStore!.isDirty ||
            !this.props.routePathMassEditStore!.isFormValid;
        let startAndEndDatesDirection1: Date[] = [];
        let startAndEndDatesDirection2: Date[] = [];
        groupedRoutePathsToDisplay.forEach((routePaths: IRoutePath[]) => {
            routePaths.forEach((routePath: IRoutePath) => {
                const excludedDates = [routePath.startTime, routePath.endTime];
                if (routePath.direction === '1') {
                    startAndEndDatesDirection1 = startAndEndDatesDirection1.concat(excludedDates);
                } else {
                    startAndEndDatesDirection2 = startAndEndDatesDirection2.concat(excludedDates);
                }
            });
        });

        return (
            <div className={s.routePathListTab}>
                {groupedRoutePathsToDisplay.map((routePaths: IRoutePath[], index) => {
                    const hasDirection1 = Boolean(routePaths.find((rp) => rp.direction === '1'));
                    const hasDirection2 = Boolean(routePaths.find((rp) => rp.direction === '2'));
                    // Group above the current group
                    const nextGroup: IRoutePath[] | null = _findNextGroup(
                        groupedRoutePathsToDisplay,
                        index,
                        hasDirection1,
                        hasDirection2
                    );
                    // Group below the current group
                    const prevGroup: IRoutePath[] | null = _findPrevGroup(
                        groupedRoutePathsToDisplay,
                        index,
                        hasDirection1,
                        hasDirection2
                    );
                    return (
                        <RoutePathGroup
                            key={`routePathGroup-${index}`}
                            routePaths={routePaths}
                            nextGroup={nextGroup}
                            prevGroup={prevGroup}
                            isEditing={isEditing}
                            stopNameMap={this.state.stopNameMap}
                            areStopNamesLoading={this.state.areStopNamesLoading}
                            index={index}
                            excludedDatesDirection1={startAndEndDatesDirection1}
                            excludedDatesDirection2={startAndEndDatesDirection2}
                            removeNewRoutePath={this.removeNewRoutePath}
                        />
                    );
                })}
                {!isEditing && allGroupedRoutePaths.length > ROUTE_PATH_GROUP_SHOW_LIMIT && (
                    <div
                        className={s.toggleAllRoutePathsVisibleButton}
                        onClick={this.props.toggleAllRoutePathsVisible}
                    >
                        {!this.props.areAllRoutePathsVisible && (
                            <div className={s.threeDots}>...</div>
                        )}
                        <div className={s.toggleAllRoutePathsVisibleText}>
                            {this.props.areAllRoutePathsVisible
                                ? `Piilota reitinsuunnat`
                                : `Näytä kaikki reitinsuunnat (${this.props.routePaths.length})`}
                        </div>
                    </div>
                )}
                {this.props.loginStore!.hasWriteAccess && isEditing && (
                    <SaveButton
                        onClick={() => this.showSavePrompt()}
                        disabled={isSaveButtonDisabled}
                        savePreventedNotification={''}
                    >
                        Tallenna muutokset
                    </SaveButton>
                )}
            </div>
        );
    }
}

const _findNextGroup = (
    groupedRoutePaths: IRoutePath[][],
    index: number,
    hasDirection1: boolean,
    hasDirection2: boolean
): IRoutePath[] | null => {
    if (index > 0) {
        // Group above the current group
        for (let i = index - 1; i >= 0; i -= 1) {
            const currentGroup = groupedRoutePaths[i];
            if (_hasGroupRoutePathWithDirection(currentGroup, hasDirection1, hasDirection2)) {
                return currentGroup;
            }
        }
    }
    return null;
};

const _findPrevGroup = (
    groupedRoutePaths: IRoutePath[][],
    index: number,
    hasDirection1: boolean,
    hasDirection2: boolean
): IRoutePath[] | null => {
    if (index < groupedRoutePaths.length - 1) {
        // Group below the current group
        for (let i = index + 1; i < groupedRoutePaths.length; i += 1) {
            const currentGroup = groupedRoutePaths[i];
            if (_hasGroupRoutePathWithDirection(currentGroup, hasDirection1, hasDirection2)) {
                return currentGroup;
            }
        }
    }
    return null;
};

const _hasGroupRoutePathWithDirection = (
    routePaths: IRoutePath[],
    hasDirection1: boolean,
    hasDirection2: boolean
) => {
    return routePaths.find((rp) => {
        if (hasDirection1 && rp.direction === '1') return true;
        if (hasDirection2 && rp.direction === '2') return true;
        return false;
    });
};

export default RoutePathListTab;

export { IRoutePathStopNames };
