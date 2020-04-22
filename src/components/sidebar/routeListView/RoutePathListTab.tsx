import classNames from 'classnames';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import Moment from 'moment';
import React from 'react';
import { FiInfo } from 'react-icons/fi';
import { Button } from '~/components/controls';
import InputContainer from '~/components/controls/InputContainer';
import SavePrompt, { ISaveModel } from '~/components/overlays/SavePrompt';
import SaveButton from '~/components/shared/SaveButton';
import Loader from '~/components/shared/loader/Loader';
import TransitType from '~/enums/transitType';
import { IRoutePath } from '~/models';
import navigator from '~/routing/navigator';
import routeBuilder from '~/routing/routeBuilder';
import subSites from '~/routing/subSites';
import RoutePathMassEditService from '~/services/routePathMassEditService';
import RoutePathService from '~/services/routePathService';
import { AlertStore } from '~/stores/alertStore';
import { ConfirmStore } from '~/stores/confirmStore';
import { ErrorStore } from '~/stores/errorStore';
import { LoginStore } from '~/stores/loginStore';
import { MapStore } from '~/stores/mapStore';
import { RouteListStore } from '~/stores/routeListStore';
import { RoutePathMassEditStore } from '~/stores/routePathMassEditStore';
import { UserStore } from '~/stores/userStore';
import { toDateString } from '~/utils/dateUtils';
import ToggleSwitch from '../../controls/ToggleSwitch';
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
    userStore?: UserStore;
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

@inject('routeListStore', 'mapStore', 'confirmStore', 'userStore', 'loginStore', 'alertStore', 'errorStore', 'routePathMassEditStore')
@observer
class RoutePathListTab extends React.Component<IRoutePathListTabProps, IRoutePathListTabState> {
    private _isMounted: boolean;
    constructor(props: IRoutePathListTabProps) {
        super(props);
        this.state = {
            stopNameMap: new Map(),
            areStopNamesLoading: true,
            allGroupedRoutePaths: [],
            groupedRoutePathsToDisplay: []
        };
    }

    private _setState = (newState: object) => {
        if (this._isMounted) {
            this.setState(newState);
        }
    };

    componentWillMount() {
        this._isMounted = true;
        this.updateGroupedRoutePathsToDisplay();
    }

    componentDidUpdate(prevProps: IRoutePathListTabProps) {
        if (prevProps.areAllRoutePathsVisible !== this.props.areAllRoutePathsVisible || !_.isEqual(prevProps.routePaths, this.props.routePaths)) {
            this.updateGroupedRoutePathsToDisplay();
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    private updateGroupedRoutePathsToDisplay = () => {
        const routePaths = this.props.routePaths;
        const allGroupedRoutePaths: IRoutePath[][] = this.groupRoutePathsOnDates(routePaths);
        const groupedRoutePathsToDisplay = this.props.areAllRoutePathsVisible
            ? allGroupedRoutePaths
            : allGroupedRoutePaths.slice(0, ROUTE_PATH_GROUP_SHOW_LIMIT);
        this.fetchStopNames(groupedRoutePathsToDisplay);
        this._setState({
            allGroupedRoutePaths,
            groupedRoutePathsToDisplay
        });
        this.setRoutePathsVisible(groupedRoutePathsToDisplay);
    }

    private groupRoutePathsOnDates = (routePaths: IRoutePath[]): IRoutePath[][] => {
        const res = {};
        routePaths.forEach(rp => {
            const identifier = rp.startTime.toLocaleDateString() + rp.endTime.toLocaleDateString();
            (res[identifier] = res[identifier] || []).push(rp);
        });

        const list: IRoutePath[][] = Object.values(res);
        list.sort(
            (a: IRoutePath[], b: IRoutePath[]) =>
                b[0].startTime.getTime() - a[0].startTime.getTime()
        );
        list.forEach((routePaths: IRoutePath[]) => {
            routePaths.sort((a: IRoutePath, b: IRoutePath) => a.direction === '1' ? -1 : 1);
        });
        return list;
    };

    private fetchStopNames = async (groupedRoutePathsToDisplay: IRoutePath[][]) => {
        const stopNameMap = this.state.stopNameMap;
        this._setState({
            areStopNamesLoading: true
        });
        const promises: Promise<void>[] = [];
        for (const routePaths of groupedRoutePathsToDisplay) {
            for (let i = 0; i < routePaths.length; i += 1) {
                const routePath: IRoutePath = routePaths[i];
                const oldStopNames = stopNameMap.get(routePath.internalId);
                if (!oldStopNames) {
                    const createPromise = async () => {
                        const stopNames = await RoutePathService.fetchFirstAndLastStopNamesOfRoutePath({
                            routeId: routePath.routeId,
                            direction: routePath.direction,
                            startTime: routePath.startTime
                        });
                        stopNameMap.set(routePath.internalId, stopNames as IRoutePathStopNames);
                    }
                    promises.push(createPromise());
                }
            }
        }

        Promise.all(promises).then(() => {
            this._setState({
                stopNameMap,
                areStopNamesLoading: false
            });
        })
    }

    private setRoutePathsVisible = (groupedRoutePathsToDisplay: IRoutePath[][]) => {
        let isAnyRoutePathVisible = false;
        groupedRoutePathsToDisplay.forEach((groupedRoutePaths: IRoutePath[]) => {
            groupedRoutePaths.forEach((routePath: IRoutePath) => {
                if (routePath.visible) {
                    isAnyRoutePathVisible = true;
                }
            })
        })
        if (!isAnyRoutePathVisible) {
            groupedRoutePathsToDisplay.forEach((groupedRoutePaths: IRoutePath[]) => {
                groupedRoutePaths.forEach((routePath: IRoutePath) => {
                    if (this.isCurrentTimeWithinRoutePathTimeSpan(routePath)) {
                        this.props.routeListStore!.setRoutePathVisibility(
                            true,
                            routePath.internalId
                        );
                    }
                })
            })
        }
    }

    // TODO: move into GroupedRoutePaths.tsx?
    private renderGroupedRoutePaths = (groupedRoutePaths: IRoutePath[][]) => {
        return groupedRoutePaths.map((routePaths: IRoutePath[], index) => {
            const hasDirection1 = Boolean(routePaths.find(rp => rp.direction === '1'));
            const hasDirection2 = Boolean(routePaths.find(rp => rp.direction === '2'));
            // Group above the current group
            const nextGroup: IRoutePath[] | null = _findNextGroup(groupedRoutePaths, index, hasDirection1, hasDirection2);
            // Group below the current group
            const prevGroup: IRoutePath[] | null = _findPrevGroup(groupedRoutePaths, index, hasDirection1, hasDirection2);

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
            const first = routePaths[0];
            const header = `${toDateString(first.startTime)} - ${toDateString(first.endTime)}`;

            const validationResult = this.props.routePathMassEditStore!.massEditRoutePaths?.find(m => m.routePath.internalId === first.internalId)?.validationResult;
            return (
                <div
                    key={header}
                    className={classNames(s.groupedRoutes, index % 2 ? s.shadow : undefined)}
                >
                    <div className={s.groupedRoutesDates}>
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
                    </div>
                    <div className={s.groupedRoutesContent}>
                        {this.renderRoutePathList(routePaths)}
                    </div>
                </div>
            );
        });
    };

    private updateStartDates = (routePaths: IRoutePath[]) => (value: Date) => {
        routePaths.forEach(rp => {
            this.props.routePathMassEditStore!.updateRoutePathStartDate(rp.internalId, value);
        })
    }

    private updateEndDates = (routePaths: IRoutePath[]) => (value: Date) => {
        routePaths.forEach(rp => {
            this.props.routePathMassEditStore!.updateRoutePathEndDate(rp.internalId, value);
        })
    }

    private renderRoutePathList = (routePaths: IRoutePath[]) => {
        return routePaths.map((routePath: IRoutePath) => {
            const toggleRoutePathVisibility = () => {
                this.props.routeListStore!.toggleRoutePathVisibility(routePath.internalId);
            };

            const openRoutePathView = () => {
                const routePathViewLink = routeBuilder
                    .to(subSites.routePath)
                    .toTarget(
                        ':id',
                        [
                            routePath.routeId,
                            Moment(routePath.startTime).format('YYYY-MM-DDTHH:mm:ss'),
                            routePath.direction
                        ].join(',')
                    )
                    .toLink();
                navigator.goTo({ link: routePathViewLink });
            };

            const shouldHighlightRoutePath = this.isCurrentTimeWithinRoutePathTimeSpan(routePath);
            const stopNames = this.state.stopNameMap.get(routePath.internalId);
            const isLoading = !stopNames && this.state.areStopNamesLoading;
            const stopOriginFi = stopNames?.firstStopName ? stopNames.firstStopName : '-';
            const stopDestinationFi = stopNames?.lastStopName ? stopNames?.lastStopName : '-';
            const stopDestinations = `${stopOriginFi} - ${stopDestinationFi}`;
            const routePathDestinations = `${routePath.originFi} - ${routePath.destinationFi}`;
            return (
                <div className={s.routePathContainer} key={routePath.internalId}>
                    <div
                        className={
                            shouldHighlightRoutePath
                                ? classNames(s.routePathInfo, s.highlight)
                                : s.routePathInfo
                        }
                    >
                        <div className={s.routePathDirection}>{routePath.direction}</div>
                        <div>
                            {isLoading ? (
                                <Loader containerClassName={s.stopNameLoader} size='tiny' hasNoMargin={true} />
                            ) : (
                                <>
                                    <div className={s.destinations1}>
                                        {this.props.userStore!.userTransitType === TransitType.BUS ? routePathDestinations : stopDestinations}
                                    </div>
                                    <div className={s.destinations2}>
                                        {this.props.userStore!.userTransitType === TransitType.BUS ? stopDestinations : routePathDestinations}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <div className={s.routePathControls}>
                        <ToggleSwitch
                            onClick={toggleRoutePathVisibility}
                            value={routePath.visible}
                            color={routePath.visible ? routePath.color! : '#898989'}
                        />
                        <Button
                            className={s.openRoutePathViewButton}
                            hasReverseColor={true}
                            onClick={openRoutePathView}
                            data-cy='openRoutePathViewButton'
                        >
                            <FiInfo />
                        </Button>
                    </div>
                </div>
            );
        });
    };

    private isCurrentTimeWithinRoutePathTimeSpan = (routePath: IRoutePath) => {
        return Moment(routePath.startTime).isBefore(Moment()) &&
            Moment(routePath.endTime).isAfter(Moment());
    };

    private showSavePrompt = () => {
        const confirmStore = this.props.confirmStore;
        const saveModels: ISaveModel[] = [];
        this.props.routePathMassEditStore!.massEditRoutePaths!.forEach(massEditRp => {
            saveModels.push({
                type: 'saveModel',
                newData: massEditRp.routePath,
                oldData: massEditRp.oldRoutePath ? massEditRp.oldRoutePath : {},
                subTopic: `${massEditRp.routePath.originFi} - ${massEditRp.routePath.destinationFi}`,
                model: 'routePath'
            })
        });
        confirmStore!.openConfirm({
            content: <SavePrompt models={saveModels} />,
            onConfirm: () => {
                this.save();
            }
        });
    };

    private save = async () => {
        this._setState({ isLoading: true });

        try {
            await RoutePathMassEditService.massEditRoutePaths(this.props.routePathMassEditStore!.massEditRoutePaths!);
            this.props.routePathMassEditStore!.clear();
            // TODO: clear & fetch routePaths
            this.props.alertStore!.setFadeMessage({ message: 'Tallennettu!' });
        } catch (e) {
            this.props.errorStore!.addError(`Tallennus epäonnistui`, e);
        }
        this.props.routeListStore!.setRouteIdToEdit(null);
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
        const isSaveButtonDisabled = !this.props.routePathMassEditStore!.isDirty || !this.props.routePathMassEditStore!.isFormValid;
        return (
            <div className={s.routePathListTab}>
                {this.renderGroupedRoutePaths(groupedRoutePathsToDisplay)}
                {allGroupedRoutePaths.length > ROUTE_PATH_GROUP_SHOW_LIMIT && (
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
                                : `Näytä kaikki reitinsuunnat (${
                                      this.props.routePaths.length
                                  })`}
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


const _findNextGroup = (groupedRoutePaths: IRoutePath[][], index: number, hasDirection1: boolean, hasDirection2: boolean): IRoutePath[] | null => {
    if (index > 0) {
         // Group above the current group
        for (let i = index - 1; i >= 0; i -= 1) {
            const currentGroup = groupedRoutePaths[i]
            if (_hasGroupRoutePathWithDirection(currentGroup, hasDirection1, hasDirection2)) {
                return currentGroup;
            }
        }
    }
    return null;
};

const _findPrevGroup = (groupedRoutePaths: IRoutePath[][], index: number, hasDirection1: boolean, hasDirection2: boolean): IRoutePath[] | null => {
    if (index < groupedRoutePaths.length - 1) {
        // Group below the current group
        for (let i = index + 1; i < groupedRoutePaths.length; i += 1) {
            const currentGroup = groupedRoutePaths[i]
            if (_hasGroupRoutePathWithDirection(currentGroup, hasDirection1, hasDirection2)) {
                return currentGroup;
            }
        }
    }
    return null;
};

const _hasGroupRoutePathWithDirection = (routePaths: IRoutePath[], hasDirection1: boolean, hasDirection2: boolean) => {
    return routePaths.find(rp => {
        if (hasDirection1 && rp.direction === '1') return true;
        if (hasDirection2 && rp.direction === '2') return true;
        return false;
    })
}

export default RoutePathListTab;
