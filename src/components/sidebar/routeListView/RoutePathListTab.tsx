import _ from 'lodash';
import { reaction, IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import Moment from 'moment';
import React from 'react';
import { Button } from '~/components/controls';
import { ISaveModel } from '~/components/overlays/SavePrompt';
import SaveButton from '~/components/shared/SaveButton';
import ButtonType from '~/enums/buttonType';
import TransitType from '~/enums/transitType';
import { IRoutePath } from '~/models';
import ISchedule from '~/models/ISchedule';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import RoutePathMassEditService from '~/services/routePathMassEditService';
import ScheduleService from '~/services/scheduleService';
import { AlertStore, AlertType } from '~/stores/alertStore';
import { ConfirmStore } from '~/stores/confirmStore';
import { ErrorStore } from '~/stores/errorStore';
import { LoginStore } from '~/stores/loginStore';
import { MapStore } from '~/stores/mapStore';
import { RouteListStore } from '~/stores/routeListStore';
import { RoutePathCopyStore } from '~/stores/routePathCopyStore';
import { RoutePathLayerListStore } from '~/stores/routePathLayerListStore';
import { RoutePathMassEditStore } from '~/stores/routePathMassEditStore';
import RoutePathUtils from '~/utils/RoutePathUtils';
import { getMaxDate, isCurrentDateWithinTimeSpan, toMidnightDate } from '~/utils/dateUtils';
import RoutePathGroup from './RoutePathGroup';
import * as s from './routePathListTab.scss';

interface IRoutePathListTabProps {
    originalRoutePaths: IRoutePath[];
    isEditing: boolean;
    lineId: string;
    routeId: string;
    transitType: TransitType;
    areAllRoutePathsVisible: boolean;
    toggleAllRoutePathsVisible: () => void;
    routeListStore?: RouteListStore;
    routePathLayerListStore?: RoutePathLayerListStore;
    mapStore?: MapStore;
    confirmStore?: ConfirmStore;
    loginStore?: LoginStore;
    alertStore?: AlertStore;
    errorStore?: ErrorStore;
    routePathCopyStore?: RoutePathCopyStore;
    routePathMassEditStore?: RoutePathMassEditStore;
}

interface IRoutePathListTabState {
    areStopNamesLoading: boolean;
    hasOldRoutePaths: boolean | null;
    allGroupedRoutePaths: IRoutePath[][];
    groupedRoutePathsToDisplay: IRoutePath[][];
    routePathSelectedToBeCompared: IRoutePath | null;
}

@inject(
    'routeListStore',
    'routePathLayerListStore',
    'mapStore',
    'confirmStore',
    'loginStore',
    'alertStore',
    'errorStore',
    'routePathCopyStore',
    'routePathMassEditStore'
)
@observer
class RoutePathListTab extends React.Component<IRoutePathListTabProps, IRoutePathListTabState> {
    private _isMounted: boolean;
    private selectedGroupsListener: IReactionDisposer | null = null;
    private routePathsListener: IReactionDisposer | null = null;
    constructor(props: IRoutePathListTabProps) {
        super(props);
        this.state = {
            areStopNamesLoading: true,
            hasOldRoutePaths: null,
            allGroupedRoutePaths: [],
            groupedRoutePathsToDisplay: [],
            routePathSelectedToBeCompared: null,
        };
    }

    private _setState = (newState: object) => {
        if (this._isMounted) {
            this.setState(newState);
        }
    };

    componentDidMount() {
        this._isMounted = true;
        this.fetchStopNames();
        this.selectedGroupsListener = reaction(
            () =>
                this.props.isEditing &&
                this.props.routePathMassEditStore!.selectedRoutePathIdGroups,
            () => this.updateGroupedRoutePathsToDisplay()
        );
        this.routePathsListener = reaction(
            () =>
                this.props.isEditing &&
                this.props.routePathMassEditStore!.massEditRoutePaths !== null &&
                this.props.routePathMassEditStore!.routePaths,
            () => this.updateGroupedRoutePathsToDisplay()
        );
        this.updateGroupedRoutePathsToDisplay();
    }

    componentDidUpdate(prevProps: IRoutePathListTabProps) {
        if (prevProps.areAllRoutePathsVisible !== this.props.areAllRoutePathsVisible) {
            this.updateGroupedRoutePathsToDisplay();
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
        if (this.selectedGroupsListener) {
            this.selectedGroupsListener();
        }
        if (this.routePathsListener) {
            this.routePathsListener();
        }
    }

    private getRoutePaths = (): IRoutePath[] => {
        return this.props.isEditing
            ? this.props.routePathMassEditStore!.routePaths
            : this.props.originalRoutePaths;
    };

    /**
     * TODO: better would be to have this logic in a store.
     * Updates groupedRoutePathsToDisplay with the following way:
     * 1) Gets all groupedRoutePaths from this.getGroupedRoutePaths()
     * 2) fetches stop names for groupedRoutePathsToDisplay
     * 3) updates allGroupedRoutePaths, groupedRoutePathsToDisplay
     */
    private updateGroupedRoutePathsToDisplay = () => {
        const routePaths = _.cloneDeep(this.getRoutePaths());
        if (routePaths.length === 0) return;
        const allGroupedRoutePaths: IRoutePath[][] = this.props.isEditing
            ? this.getMassEditGroupedRoutePaths(routePaths)
            : this.getReadOnlyGroupedRoutePaths(routePaths);
        let groupedRoutePathsToDisplay = allGroupedRoutePaths;
        let lastSeenNotOldRoutePathGroupIndex = 0;
        allGroupedRoutePaths.forEach((groupedRp: IRoutePath[], index: number) => {
            const isNotOldRoutePath =
                groupedRp[0].startDate.getTime() >= toMidnightDate(new Date()).getTime() ||
                groupedRp[0].endDate.getTime() >= toMidnightDate(new Date()).getTime();
            if (isNotOldRoutePath) {
                lastSeenNotOldRoutePathGroupIndex = index + 1;
            }
        });
        const hasOldRoutePaths = lastSeenNotOldRoutePathGroupIndex < allGroupedRoutePaths.length;
        if (!this.props.areAllRoutePathsVisible) {
            groupedRoutePathsToDisplay = allGroupedRoutePaths.slice(
                0,
                lastSeenNotOldRoutePathGroupIndex
            );
        }
        this._setState({
            hasOldRoutePaths,
            allGroupedRoutePaths,
            groupedRoutePathsToDisplay,
        });
        this.setRoutePathsVisible(groupedRoutePathsToDisplay);
    };

    // Create routePath pairs from routePathsToGroup, sort them by date
    private getReadOnlyGroupedRoutePaths = (routePaths: IRoutePath[]): IRoutePath[][] => {
        const routePathsToGroup = routePaths;
        const res = {};
        routePathsToGroup.forEach((rp) => {
            const identifier = rp.startDate.toLocaleDateString() + rp.endDate.toLocaleDateString();
            (res[identifier] = res[identifier] || []).push(rp);
        });
        const list: IRoutePath[][] = Object.keys(res).map((key: string) => {
            return res[key];
        });
        list.sort(
            (a: IRoutePath[], b: IRoutePath[]) =>
                b[0].startDate.getTime() - a[0].startDate.getTime()
        );
        list.forEach((routePaths: IRoutePath[]) => {
            routePaths.sort((a: IRoutePath, b: IRoutePath) => (a.direction === '1' ? -1 : 1));
        });
        return list;
    };

    /**
     * Creates routePath groups (1-2 routePaths in a group) with the following order:
     * 1) routePaths paired according to routePathMassEditStore.selectedRoutePathIdPairs
     * 2) remaining routePaths with date > getMaxDate in single groups
     * 3) remaining routePaths grouped by date
     */
    private getMassEditGroupedRoutePaths = (routePaths: IRoutePath[]): IRoutePath[][] => {
        let routePathsToGroup = routePaths;
        const selectedRoutePathIdGroups: string[][] = this.props.routePathMassEditStore!
            .selectedRoutePathIdGroups;

        // Take out selectedRoutePaths out from routePathsToGroup
        const selectedRoutePaths: IRoutePath[] = []; // RoutePaths that are filtered from routePathsToGroup
        routePathsToGroup = routePathsToGroup.filter((rp: IRoutePath) => {
            const idGroup = selectedRoutePathIdGroups.find((idGroup: string[]) => {
                return idGroup.includes(rp.internalId);
            })!;
            const isFoundFromSelectedIdGroups = Boolean(idGroup);
            if (isFoundFromSelectedIdGroups) {
                selectedRoutePaths.push(rp);
            }
            return !isFoundFromSelectedIdGroups;
        });

        // Transform selectedRoutePathIdGroups: string[][] into selectedRoutePathGroups: IRoutePath[][]
        const selectedRoutePathGroups: IRoutePath[][] = [];
        selectedRoutePathIdGroups.forEach((idGroup: string[]) => {
            const newRpGroup: IRoutePath[] = [];
            idGroup.forEach((id: string) => {
                const rp = selectedRoutePaths.find((_rp) => _rp.internalId === id);
                newRpGroup.push(rp!);
            });
            selectedRoutePathGroups.push(newRpGroup);
        });

        // Take out new routePaths with unselected date from routePathsToGroup
        const newRoutePathGroups: IRoutePath[][] = [];
        routePathsToGroup = routePathsToGroup.filter((rp: IRoutePath) => {
            const isNewRoutePath = rp.startDate.getTime() > getMaxDate().getTime();
            if (isNewRoutePath) {
                newRoutePathGroups.push([rp]);
            }
            return !isNewRoutePath;
        });

        // Create routePath pairs from remaining (existing) routePaths, sort them by date
        const list: IRoutePath[][] = this.getReadOnlyGroupedRoutePaths(routePathsToGroup);

        // Add selected routePaths to the beginning of the list
        selectedRoutePathGroups.forEach((rpGroup) => list.unshift(rpGroup));

        // Add new routePaths them to the beginning of the list
        newRoutePathGroups.forEach((rpGroup) => list.unshift(rpGroup));

        return list;
    };

    private fetchStopNames = async () => {
        this._setState({
            areStopNamesLoading: true,
        });

        let routePaths: IRoutePath[];
        if (this.props.isEditing) {
            // Get routePaths from massEditStore to get the original (old) routePaths for stopName query
            routePaths = this.props.routePathMassEditStore!.massEditRoutePaths!.map(
                (massEditRp) => {
                    if (massEditRp.isNew) {
                        // Have to set internalId from massEditRp
                        const temp = _.cloneDeep(massEditRp.oldRoutePath!);
                        temp.internalId = massEditRp.id;
                        return temp;
                    }
                    return massEditRp.routePath;
                }
            );
        } else {
            routePaths = this.getRoutePaths();
        }

        await this.props.routeListStore!.fetchStopNames(routePaths);
        this._setState({
            areStopNamesLoading: false,
        });
    };

    private setRoutePathsVisible = (groupedRoutePathsToDisplay: IRoutePath[][]) => {
        let isAnyRoutePathVisible = false;
        groupedRoutePathsToDisplay.forEach((groupedRoutePaths: IRoutePath[]) => {
            groupedRoutePaths.forEach((routePath: IRoutePath) => {
                if (routePath.isVisible) {
                    isAnyRoutePathVisible = true;
                }
            });
        });
        if (!isAnyRoutePathVisible) {
            groupedRoutePathsToDisplay.forEach((groupedRoutePaths: IRoutePath[]) => {
                groupedRoutePaths.forEach((routePath: IRoutePath) => {
                    if (isCurrentDateWithinTimeSpan(routePath.startDate, routePath.endDate)) {
                        this.props.routePathLayerListStore!.setRoutePathVisibility({
                            id: routePath.internalId,
                            isVisible: true,
                        });
                    }
                });
            });
        }
    };

    private showSavePrompt = async () => {
        const confirmStore = this.props.confirmStore;
        const routeId = this.props.routeId;
        const activeSchedules: ISchedule[] = await ScheduleService.fetchActiveSchedules(routeId);
        const modifiedSaveModels: ISaveModel[] = [];
        const copiedSaveModels: ISaveModel[] = [];
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
            const saveModel: ISaveModel = {
                type: 'saveModel',
                newData: newRoutePath,
                oldData: oldRoutePath ? oldRoutePath : {},
                subTopic: `${newRoutePath.originFi} - ${newRoutePath.destinationFi}`,
                model: 'routePath',
            };
            if (massEditRp.isNew) {
                copiedSaveModels.push(saveModel);
            } else {
                if (!_.isEqual(saveModel.newData, saveModel.oldData)) {
                    modifiedSaveModels.push(saveModel);
                }
            }
        });
        const savePromptSections = [];
        if (modifiedSaveModels.length > 0) {
            savePromptSections.push({
                models: modifiedSaveModels,
                sectionTopic: 'Muokatut reitinsuunnat',
            });
        }
        if (copiedSaveModels.length > 0) {
            savePromptSections.push({
                models: copiedSaveModels,
                sectionTopic: 'Kopioidut reitinsuunnat',
            });
        }
        confirmStore!.openConfirm({
            confirmComponentName: 'routePathConfirm',
            confirmData: {
                routeId,
                activeSchedules,
                savePromptSections,
                routePaths: this.props.routePathMassEditStore!.routePaths,
            },
            onConfirm: () => {
                this.save();
            },
            confirmButtonText: 'Tallenna',
            confirmType: 'save',
        });
    };

    private save = async () => {
        this._setState({ isLoading: true });
        let wasSaveSuccesful = false;
        try {
            this.props.alertStore!.setLoaderMessage('Tallennetaan reitinsuuntia...');
            await RoutePathMassEditService.massEditRoutePaths({
                routeId: this.props.routeId,
                massEditRoutePaths: this.props.routePathMassEditStore!.massEditRoutePaths!,
            });
            this.props.routeListStore!.removeFromRouteItems(this.props.routeId);
            await this.props.alertStore!.setFadeMessage({ message: 'Tallennettu!' });
            wasSaveSuccesful = true;
        } catch (e) {
            this.props.alertStore!.close();
            this.props.errorStore!.addError('', e);
        }
        this.props.routePathMassEditStore!.clear();
        this.props.routeListStore!.setRouteIdToEdit(null);
        // Fetch routes only after editing is disabled (otherwise stopNames might not work after saving)
        if (wasSaveSuccesful) {
            await this.props.routeListStore!.fetchRoutes({ forceUpdate: true });
        }
    };

    private renderBottomBarButtons = () => {
        if (!this.props.loginStore!.hasWriteAccess) return null;

        const isCopyRoutePathButtonDisabled =
            this.props.routeId !== this.props.routeListStore!.routeIdToEdit;
        return (
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
                    disabled={isCopyRoutePathButtonDisabled}
                    onDisabledButtonClick={
                        isCopyRoutePathButtonDisabled
                            ? () =>
                                  this.props.alertStore!.setNotificationMessage({
                                      type: AlertType.Info,
                                      message: 'Aktivoi editointi kopioidaksesi reitinsuuntia.',
                                  })
                            : undefined
                    }
                    isWide={true}
                    data-cy='copyRoutePathButton'
                >
                    {`Kopioi reitinsuuntia`}
                </Button>
            </div>
        );
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
        this.props.routePathCopyStore!.init({ lineId, routeId, transitType });
    };

    private selectRoutePathToBeCompared = (routePath: IRoutePath) => {
        const isTheSameRoutePathCurrentlySelected =
            this.state.routePathSelectedToBeCompared &&
            RoutePathUtils.getAreRoutePathsEqual(
                this.state.routePathSelectedToBeCompared,
                routePath
            );
        if (
            !isTheSameRoutePathCurrentlySelected &&
            this.state.routePathSelectedToBeCompared !== null
        ) {
            _redirectToRoutePathComparisonView(this.state.routePathSelectedToBeCompared, routePath);
        } else {
            this._setState({
                routePathSelectedToBeCompared: isTheSameRoutePathCurrentlySelected
                    ? null
                    : routePath,
            });
        }
    };

    render() {
        const isEditing = this.props.isEditing;
        const routePaths = this.getRoutePaths();
        if (routePaths.length === 0) {
            return (
                <div className={s.routePathListTab}>
                    <div className={s.noRoutePathsMessage}>Reitillä ei ole reitinsuuntia.</div>
                    {this.renderBottomBarButtons()}
                </div>
            );
        }
        const groupedRoutePathsToDisplay = this.state.groupedRoutePathsToDisplay;
        const isSaveButtonDisabled =
            !this.props.routePathMassEditStore!.isDirty ||
            !this.props.routePathMassEditStore!.isFormValid;
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
                            stopNameMap={this.props.routeListStore!.stopNameMap}
                            areStopNamesLoading={this.state.areStopNamesLoading}
                            index={index}
                            routePathSelectedToBeCompared={this.state.routePathSelectedToBeCompared}
                            selectRoutePathToBeCompared={this.selectRoutePathToBeCompared}
                        />
                    );
                })}
                {!this.props.areAllRoutePathsVisible && groupedRoutePathsToDisplay.length === 0 && (
                    <div className={s.noRoutePathsWithCurrentTimespanMessage}>
                        Reitillä ei ole voimassaolevia tai voimaan astuvia reitinsuuntia.
                    </div>
                )}
                {this.state.hasOldRoutePaths && (
                    <div
                        className={s.toggleAllRoutePathsVisibleButton}
                        onClick={this.props.toggleAllRoutePathsVisible}
                    >
                        {!this.props.areAllRoutePathsVisible && (
                            <div className={s.threeDots}>...</div>
                        )}
                        <div className={s.toggleAllRoutePathsVisibleText}>
                            {this.props.areAllRoutePathsVisible
                                ? `Piilota vanhentuneet reitinsuunnat`
                                : `Näytä kaikki reitinsuunnat (${routePaths.length})`}
                        </div>
                    </div>
                )}
                {this.renderBottomBarButtons()}
                {this.props.loginStore!.hasWriteAccess && isEditing && (
                    <SaveButton
                        onClick={() => this.showSavePrompt()}
                        disabled={isSaveButtonDisabled}
                        savePreventedNotification={''}
                        type={'saveButton'}
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

const _redirectToRoutePathComparisonView = (rp1: IRoutePath, rp2: IRoutePath) => {
    const routePathComparisonLink = routeBuilder
        .to(SubSites.routePathComparison)
        .toTarget(
            ':id',
            [
                rp1.lineId,
                rp1.routeId,
                Moment(rp1.startDate).format('DD.MM.YYYY'),
                rp1.direction,
                rp2.lineId,
                rp2.routeId,
                Moment(rp2.startDate).format('DD.MM.YYYY'),
                rp2.direction,
            ].join(',')
        )
        .toLink();
    navigator.goTo({ link: routePathComparisonLink });
};

export default RoutePathListTab;
