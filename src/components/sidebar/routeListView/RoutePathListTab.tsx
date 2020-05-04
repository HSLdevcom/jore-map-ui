import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import Moment from 'moment';
import React from 'react';
import { Button } from '~/components/controls';
import SavePrompt, { ISaveModel } from '~/components/overlays/SavePrompt';
import SaveButton from '~/components/shared/SaveButton';
import ButtonType from '~/enums/buttonType';
import TransitType from '~/enums/transitType';
import { IRoutePath } from '~/models';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import RoutePathMassEditService from '~/services/routePathMassEditService';
import RoutePathService from '~/services/routePathService';
import { AlertStore } from '~/stores/alertStore';
import { ConfirmStore } from '~/stores/confirmStore';
import { CopyRoutePathStore } from '~/stores/copyRoutePathStore';
import { ErrorStore } from '~/stores/errorStore';
import { LoginStore } from '~/stores/loginStore';
import { MapStore } from '~/stores/mapStore';
import { RouteListStore } from '~/stores/routeListStore';
import { RoutePathLayerStore } from '~/stores/routePathLayerStore';
import { RoutePathMassEditStore } from '~/stores/routePathMassEditStore';
import { getMaxDate } from '~/utils/dateUtils';
import RoutePathGroup from './RoutePathGroup';
import * as s from './routePathListTab.scss';

interface IRoutePathStopNames {
    firstStopName: string;
    lastStopName: string;
}

interface IRoutePathListTabProps {
    routePaths: IRoutePath[];
    isEditing: boolean;
    lineId: string;
    routeId: string;
    transitType: TransitType;
    areAllRoutePathsVisible: boolean;
    toggleAllRoutePathsVisible: () => void;
    routeListStore?: RouteListStore;
    routePathLayerStore?: RoutePathLayerStore;
    mapStore?: MapStore;
    confirmStore?: ConfirmStore;
    loginStore?: LoginStore;
    alertStore?: AlertStore;
    errorStore?: ErrorStore;
    copyRoutePathStore?: CopyRoutePathStore;
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
    'routePathLayerStore',
    'mapStore',
    'confirmStore',
    'loginStore',
    'alertStore',
    'errorStore',
    'copyRoutePathStore',
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
        if (routePaths.length === 0) return;

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
            const identifier = rp.startDate.toLocaleDateString() + rp.endDate.toLocaleDateString();
            (res[identifier] = res[identifier] || []).push(rp);
        });

        const list: IRoutePath[][] = Object.values(res);
        list.sort(
            (a: IRoutePath[], b: IRoutePath[]) =>
                b[0].startDate.getTime() - a[0].startDate.getTime()
        );
        list.forEach((routePaths: IRoutePath[]) => {
            routePaths.sort((a: IRoutePath, b: IRoutePath) => (a.direction === '1' ? -1 : 1));
        });

        if (list[0][0].startDate.getTime() > getMaxDate().getTime()) {
            const newRoutePaths = _.cloneDeep(list[0]);
            list.shift();
            newRoutePaths.forEach((newRp) => {
                list.unshift([newRp]);
            });
        }

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
                        let startDate = routePath.startDate;
                        if (this.props.isEditing) {
                            // Have to use old routePath's data for querying, current routePath's data might have changed
                            const oldRoutePath = this.props.routePathMassEditStore!.massEditRoutePaths?.find(
                                (rp) => rp.id === routePath.internalId
                            )!.oldRoutePath!;
                            direction = oldRoutePath.direction;
                            startDate = oldRoutePath.startDate;
                        }
                        const stopNames = await RoutePathService.fetchFirstAndLastStopNamesOfRoutePath(
                            {
                                direction,
                                startDate,
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
                        this.props.routePathLayerStore!.setRoutePathVisibility({
                            id: routePath.internalId,
                            isVisible: true,
                        });
                    }
                });
            });
        }
    };

    private isCurrentTimeWithinRoutePathTimeSpan = (routePath: IRoutePath) => {
        return (
            Moment(routePath.startDate).isBefore(Moment()) &&
            Moment(routePath.endDate).isAfter(Moment())
        );
    };

    private showSavePrompt = () => {
        const confirmStore = this.props.confirmStore;
        const saveModels: ISaveModel[] = [];
        this.props.routePathMassEditStore!.massEditRoutePaths!.forEach((massEditRp) => {
            const newRoutePath = _.cloneDeep(massEditRp.routePath);
            delete newRoutePath.internalId;
            const oldRoutePath = _.cloneDeep(massEditRp.oldRoutePath);
            if (oldRoutePath) {
                delete oldRoutePath['internalId'];
                if (massEditRp.isNew) {
                    delete oldRoutePath['startDate'];
                    delete oldRoutePath['endDate'];
                }
            }
            saveModels.push({
                type: 'saveModel',
                newData: newRoutePath,
                oldData: oldRoutePath ? oldRoutePath : {},
                subTopic: `${newRoutePath.originFi} - ${newRoutePath.destinationFi}`,
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

    private redirectToNewRoutePathView = () => () => {
        const { lineId, routeId } = this.props;
        const newRoutePathLink = routeBuilder
            .to(SubSites.newRoutePath)
            .set(QueryParams.routeId, routeId)
            .set(QueryParams.lineId, lineId)
            .toLink();

        navigator.goTo({ link: newRoutePathLink });
    };

    private openCopyRoutePathView = () => () => {
        const { lineId, routeId, transitType } = this.props;
        this.props.copyRoutePathStore!.init({ lineId, routeId, transitType });
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
                const excludedDates = [routePath.startDate, routePath.endDate];
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
                {this.props.loginStore!.hasWriteAccess && (
                    <div className={s.buttonContainer}>
                        <Button
                            onClick={this.redirectToNewRoutePathView()}
                            type={ButtonType.SQUARE}
                            disabled={Boolean(this.props.routeListStore!.routeIdToEdit)}
                            isWide={true}
                        >
                            {`Luo reitinsuunta`}
                        </Button>
                        <Button
                            onClick={this.openCopyRoutePathView()}
                            type={ButtonType.SQUARE}
                            disabled={
                                this.props.routeId !== this.props.routeListStore!.routeIdToEdit
                            }
                            isWide={true}
                        >
                            {`Kopioi reitinsuunta`}
                        </Button>
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

// Group above the current group
const _findNextGroup = (
    groupedRoutePaths: IRoutePath[][],
    index: number,
    hasDirection1: boolean,
    hasDirection2: boolean
): IRoutePath[] | null => {
    if (index > 0) {
        for (let i = index - 1; i >= 0; i -= 1) {
            const currentGroup = groupedRoutePaths[i];
            if (_hasGroupRoutePathWithDirection(currentGroup, hasDirection1, hasDirection2)) {
                return currentGroup;
            }
        }
    }
    return null;
};

// Group below the current group
const _findPrevGroup = (
    groupedRoutePaths: IRoutePath[][],
    index: number,
    hasDirection1: boolean,
    hasDirection2: boolean
): IRoutePath[] | null => {
    if (index < groupedRoutePaths.length - 1) {
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
