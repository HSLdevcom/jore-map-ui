import L from 'leaflet';
import _ from 'lodash';
import { reaction, IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import Moment from 'moment';
import React from 'react';
import { match } from 'react-router';
import { Button } from '~/components/controls';
import { ISaveModel } from '~/components/overlays/SavePrompt';
import SaveButton from '~/components/shared/SaveButton';
import { ContentItem, ContentList, Tab, Tabs, TabList } from '~/components/shared/Tabs';
import TransitTypeLinks from '~/components/shared/TransitTypeLinks';
import Loader from '~/components/shared/loader/Loader';
import RoutePathComparisonContainer from '~/components/shared/routePathComparisonContainer/RoutePathComparisonContainer';
import ToolbarToolType from '~/enums/toolbarToolType';
import RoutePathFactory from '~/factories/routePathFactory';
import EventListener from '~/helpers/EventListener';
import { IRoutePath } from '~/models';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import LineService from '~/services/lineService';
import RoutePathService, {
    IGetRoutePathLengthRequest,
    IRoutePathLengthResponse,
} from '~/services/routePathService';
import RouteService from '~/services/routeService';
import { AlertStore } from '~/stores/alertStore';
import { ConfirmStore } from '~/stores/confirmStore';
import { ErrorStore } from '~/stores/errorStore';
import { LoginStore } from '~/stores/loginStore';
import { MapStore } from '~/stores/mapStore';
import { MapLayer, NetworkStore } from '~/stores/networkStore';
import { RoutePathCopySegmentStore } from '~/stores/routePathCopySegmentStore';
import { RoutePathLayerStore } from '~/stores/routePathLayerStore';
import { RoutePathLinkMassEditStore } from '~/stores/routePathLinkMassEditStore';
import { ListFilter, RoutePathStore } from '~/stores/routePathStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import RoutePathUtils from '~/utils/RoutePathUtils';
import SidebarHeader from '../SidebarHeader';
import RoutePathCopySegmentView from './RoutePathCopySegmentView/RoutePathCopySegmentView';
import RoutePathInfoTab from './routePathInfoTab/RoutePathInfoTab';
import RoutePathLinksTab from './routePathListTab/RoutePathLinksTab';
import * as s from './routePathView.scss';

interface IRoutePathViewProps {
    isNewRoutePath: boolean;
    match?: match<any>;
    alertStore?: AlertStore;
    routePathStore?: RoutePathStore;
    routePathLayerStore?: RoutePathLayerStore;
    routePathCopySegmentStore?: RoutePathCopySegmentStore;
    networkStore?: NetworkStore;
    toolbarStore?: ToolbarStore;
    errorStore?: ErrorStore;
    loginStore?: LoginStore;
    mapStore?: MapStore;
    confirmStore?: ConfirmStore;
    routePathLinkMassEditStore?: RoutePathLinkMassEditStore;
}

interface IRoutePathViewState {
    isLoading: boolean;
    isRoutePathCalculatedLengthLoading: boolean;
}

@inject(
    'routePathStore',
    'routePathLayerStore',
    'routePathCopySegmentStore',
    'networkStore',
    'toolbarStore',
    'errorStore',
    'alertStore',
    'loginStore',
    'mapStore',
    'confirmStore',
    'routePathLinkMassEditStore'
)
@observer
class RoutePathView extends React.Component<IRoutePathViewProps, IRoutePathViewState> {
    private isRoutePathLinksChangedListener: IReactionDisposer;
    private _isMounted: boolean;
    constructor(props: IRoutePathViewProps) {
        super(props);
        this.state = {
            isLoading: true,
            isRoutePathCalculatedLengthLoading: false,
        };
    }

    private _setState = (newState: object) => {
        if (this._isMounted) {
            this.setState(newState);
        }
    };

    componentDidMount() {
        this._isMounted = true;
        EventListener.on('undo', this.undo);
        EventListener.on('redo', this.redo);
        this.initialize();
        this.props.routePathStore!.setIsEditingDisabled(!this.props.isNewRoutePath);
        this.isRoutePathLinksChangedListener = reaction(
            () =>
                this.props.routePathStore!.routePath &&
                this.props.routePathStore!.routePath!.routePathLinks.length,
            this.updateCalculatedLength
        );
    }

    componentWillUnmount() {
        this._isMounted = false;
        this.isRoutePathLinksChangedListener();
        this.props.toolbarStore!.selectTool(null);
        this.props.routePathStore!.clear();
        EventListener.off('undo', this.undo);
        EventListener.off('redo', this.redo);
    }

    private undo = () => {
        this.undoIfAllowed(this.props.routePathStore!.undo);
    };

    private redo = () => {
        this.undoIfAllowed(this.props.routePathStore!.redo);
    };

    private undoIfAllowed = (undo: () => void) => {
        if (this.props.toolbarStore!.areUndoButtonsDisabled) {
            this.props.errorStore!.addError(
                `'kumoa' ja 'tee uudestaan' estetty. Sulje ensin valitut pysäkit.`
            );
        } else {
            this.props.routePathStore!.setIsEditingDisabled(false);
            undo();
        }
    };

    private initialize = async () => {
        if (this.props.isNewRoutePath) {
            await this.createNewRoutePath();
        } else {
            await this.initExistingRoutePath();
        }
        await this.initializeMap();
    };

    private createNewRoutePath = async () => {
        this._setState({ isLoading: true });
        this.props.mapStore!.initCoordinates();
        const queryParams = navigator.getQueryParamValues();
        const routeId = queryParams[QueryParams.routeId] as string;
        const lineId = queryParams[QueryParams.lineId] as string;
        try {
            const line = await LineService.fetchLine(lineId);
            const routePath = RoutePathFactory.createNewRoutePath(
                lineId,
                routeId,
                line.transitType!
            );
            this.props.routePathStore!.init({
                routePath,
                isNewRoutePath: this.props.isNewRoutePath,
            });
            this.props.toolbarStore!.selectTool(ToolbarToolType.ExtendRoutePath);
        } catch (e) {
            this.props.errorStore!.addError('Uuden reitinsuunnan luonti epäonnistui', e);
        }
        await this.fetchExistingRoutePaths({ routeId });

        this._setState({ isLoading: false });
    };

    private fetchExistingRoutePaths = async ({ routeId }: { routeId: string }) => {
        const route = await RouteService.fetchRoute({
            routeId,
            areRoutePathLinksExcluded: true,
        });
        this.props.routePathStore!.setExistingRoutePaths(route!.routePaths);
    };

    private initializeMap = async () => {
        if (this.props.isNewRoutePath) {
            this.props.networkStore!.showMapLayer(MapLayer.node);
            this.props.networkStore!.showMapLayer(MapLayer.link);
        }

        await this.setTransitType();
    };

    private setTransitType = async () => {
        const routePath = this.props.routePathStore!.routePath;
        if (routePath && routePath.lineId) {
            try {
                const line = await LineService.fetchLine(routePath.lineId);
                this.props.networkStore!.setSelectedTransitTypes([line.transitType!]);
            } catch (e) {
                this.props.errorStore!.addError('Linjan haku epäonnistui', e);
            }
        }
    };

    private initExistingRoutePath = async () => {
        this._setState({ isLoading: true });
        await this.fetchRoutePath();
        const itemToShow = navigator.getQueryParamValues()[QueryParams.showItem] as string;
        if (itemToShow) {
            this.props.routePathStore!.setSelectedTabIndex(1);
            this.props.routePathLayerStore!.setExtendedListItemId(itemToShow);
            this.props.routePathStore!.removeListFilter(ListFilter.link);
        }
        this._setState({ isLoading: false });
    };

    private fetchRoutePath = async () => {
        const [routeId, startDateString, direction] = this.props.match!.params.id.split(',');
        const routePath = await RoutePathService.fetchRoutePath({
            routeId,
            direction,
            startDate: startDateString,
            shouldFetchViaNames: true,
        });
        if (!routePath) {
            this.props.errorStore!.addError(
                `Reitinsuunnan (reitin tunnus: ${routeId}, alkupvm ${startDateString}, suunta ${direction}) haku ei onnistunut.`
            );
            const homeViewLink = routeBuilder.to(SubSites.home).toLink();
            navigator.goTo({ link: homeViewLink });
            return;
        }
        await this.fetchExistingRoutePaths({ routeId });
        this.centerMapToRoutePath(routePath);
        this.props.routePathStore!.init({ routePath, isNewRoutePath: this.props.isNewRoutePath });
    };

    private updateCalculatedLength = async () => {
        const routePath = this.props.routePathStore!.routePath;
        const hasWriteAccess = this.props.loginStore!.hasWriteAccess;
        if (!routePath || !hasWriteAccess) return;

        // RoutePathLinks needs to be coherent in order to calculate total length
        if (!RoutePathUtils.validateRoutePathLinkCoherency(routePath.routePathLinks)) {
            this.props.routePathStore!.setCalculatedRoutePathLength(null);
            this._setState({
                isRoutePathCalculatedLengthLoading: false,
            });
            return;
        }

        this._setState({
            isRoutePathCalculatedLengthLoading: true,
        });
        const requestBody: IGetRoutePathLengthRequest = {
            lineId: routePath.lineId!,
            routeId: routePath.routeId,
            transitType: routePath.transitType!,
            routePathLinks: routePath.routePathLinks,
        };
        const response: IRoutePathLengthResponse = await RoutePathService.fetchRoutePathLength(
            requestBody
        );
        this.props.routePathStore!.setCalculatedRoutePathLength(response.length);
        this.props.routePathStore!.setIsRoutePathLengthFormedByMeasuredLengths(
            response.isCalculatedFromMeasuredStopGapsOnly
        );
        this.props.routePathStore!.setUnmeasuredStopGapsList(response.unmeasuredStopGapsList);
        this.props.routePathStore!.setMissingStopGapsList(response.missingStopGapsList);

        this._setState({
            isRoutePathCalculatedLengthLoading: false,
        });
        this.props.routePathStore!.validateRoutePathLength();
    };

    private centerMapToRoutePath = (routePath: IRoutePath) => {
        const bounds: L.LatLngBounds = new L.LatLngBounds([]);

        routePath!.routePathLinks.forEach((link) => {
            link.geometry.forEach((pos) => bounds.extend(pos));
        });

        this.props.mapStore!.setMapBounds(bounds);
    };

    private save = async () => {
        this._setState({ isLoading: true });
        const routePath = this.props.routePathStore!.routePath;
        const oldRoutePath = this.props.routePathStore!.oldRoutePath;
        try {
            if (this.props.isNewRoutePath) {
                const routePathPrimaryKey = await RoutePathService.createRoutePath(routePath!);
                const routePathViewLink = routeBuilder
                    .to(SubSites.routePath)
                    .toTarget(
                        ':id',
                        [
                            routePathPrimaryKey.routeId,
                            Moment(routePathPrimaryKey.startDate).format('YYYY-MM-DDTHH:mm:ss'),
                            routePathPrimaryKey.direction,
                        ].join(',')
                    )
                    .toLink();
                navigator.goTo({ link: routePathViewLink, shouldSkipUnsavedChangesPrompt: true });
            } else {
                await RoutePathService.updateRoutePath(routePath!, oldRoutePath!);
                await this.fetchRoutePath();
                this.props.routePathStore!.setIsEditingDisabled(true);
                this._setState({ isLoading: false });
            }
            this.props.routePathLinkMassEditStore!.clear();
            this.props.alertStore!.setFadeMessage({ message: 'Tallennettu!' });
        } catch (e) {
            this.props.errorStore!.addError('', e);
            this.setState({ isLoading: false });
        }
    };

    private showSavePrompt = () => {
        const confirmStore = this.props.confirmStore;
        const currentRoutePath = this.props.routePathStore!.routePath;
        const oldRoutePath = this.props.routePathStore!.oldRoutePath;
        const saveModel: ISaveModel = {
            type: 'saveModel',
            newData: currentRoutePath ? currentRoutePath : {},
            oldData: oldRoutePath,
            model: 'routePath',
        };
        const savePromptSection = { models: [saveModel] };
        confirmStore!.openConfirm({
            confirmComponentName: 'savePrompt',
            confirmData: { savePromptSections: [savePromptSection] },
            onConfirm: () => {
                this.save();
            },
        });
    };

    private showUnmeasuredStopGapsPrompt = (onConfirm: Function) => {
        const confirmStore = this.props.confirmStore;
        const routePathStore = this.props.routePathStore!;
        const unmeasuredStopGapsList = routePathStore.unmeasuredStopGapsList;
        const missingStopGapsList = routePathStore.missingStopGapsList;

        const routePathLength = routePathStore!.routePath!.length;
        const calculatedRoutePathLength = routePathStore!.calculatedRoutePathLength;
        confirmStore!.openConfirm({
            confirmData: {
                unmeasuredStopGapsList,
                missingStopGapsList,
                routePathLength,
                calculatedRoutePathLength,
            },
            confirmComponentName: 'unmeasuredStopGapsConfirm',
            onConfirm: () => {
                onConfirm();
            },
            confirmButtonText: 'Jatka tallennukseen',
        });
    };

    private openCompareRoutePathsContainer = () => {
        this.props.routePathStore!.setIsCompareRoutePathsContainerVisible(true);
    };

    render() {
        const routePathStore = this.props.routePathStore;
        if (this.state.isLoading) {
            return (
                <div className={s.routePathView}>
                    <Loader size='medium' />
                </div>
            );
        }
        const routePath = routePathStore!.routePath;
        if (!routePath) return null;

        const isEditingDisabled = routePathStore!.isEditingDisabled;
        const routePathCopySegmentStore = this.props.routePathCopySegmentStore;
        const isCopyRoutePathSegmentViewVisible =
            routePathCopySegmentStore!.startSegmentPoint &&
            routePathCopySegmentStore!.endSegmentPoint;
        const savePreventedNotification = routePathStore!.getSavePreventedText();
        // By default, use rpLink's transitType if rpLinks exist
        const transitType =
            routePath.routePathLinks.length > 0
                ? routePath.routePathLinks[0].transitType
                : routePath.transitType!;

        return (
            <div className={s.routePathView} data-cy='routePathView'>
                <div className={s.sidebarHeaderSection}>
                    <SidebarHeader
                        isEditButtonVisible={!this.props.isNewRoutePath}
                        isBackButtonVisible={true}
                        isCloseButtonVisible={true}
                        onEditButtonClick={routePathStore!.toggleIsEditingDisabled}
                        isEditing={!routePathStore!.isEditingDisabled}
                    >
                        {this.props.isNewRoutePath ? (
                            `Uusi reitinsuunta reitille ${routePath.routeId}`
                        ) : (
                            <div className={s.linkContainer}>
                                <TransitTypeLinks
                                    lineId={routePath!.lineId!}
                                    routeId={routePath.routeId}
                                    transitType={transitType}
                                />
                            </div>
                        )}
                    </SidebarHeader>
                    <div className={s.subTopicContainer}>
                        <div>
                            {Moment(routePath.startDate).format('DD.MM.YYYY')} -{' '}
                            {Moment(routePath.endDate).format('DD.MM.YYYY')}
                            <br />
                            Suunta {routePath.direction}: {routePath.originFi} -{' '}
                            {routePath.destinationFi}
                        </div>
                    </div>
                </div>

                {isCopyRoutePathSegmentViewVisible ? (
                    <RoutePathCopySegmentView />
                ) : (
                    <>
                        {routePathStore!.isCompareRoutePathsContainerVisible ? (
                            <>
                                <Button
                                    isWide={true}
                                    hasNoMargin={true}
                                    onClick={() =>
                                        routePathStore!.setIsCompareRoutePathsContainerVisible(
                                            false
                                        )
                                    }
                                >
                                    Takaisin muokkaamaan
                                </Button>
                                <RoutePathComparisonContainer
                                    routePath1={routePathStore!.oldRoutePath!}
                                    routePath2={routePath}
                                />
                            </>
                        ) : (
                            <Tabs>
                                <TabList
                                    selectedTabIndex={routePathStore!.selectedTabIndex}
                                    setSelectedTabIndex={routePathStore!.setSelectedTabIndex}
                                >
                                    <Tab>
                                        <div>Reitinsuunnan tiedot</div>
                                    </Tab>
                                    <Tab>
                                        <div>Solmut ja linkit</div>
                                    </Tab>
                                </TabList>
                                <ContentList selectedTabIndex={routePathStore!.selectedTabIndex}>
                                    <ContentItem>
                                        <RoutePathInfoTab
                                            isEditingDisabled={isEditingDisabled}
                                            isRoutePathCalculatedLengthLoading={
                                                this.state.isRoutePathCalculatedLengthLoading
                                            }
                                        />
                                    </ContentItem>
                                    <ContentItem>
                                        <RoutePathLinksTab
                                            routePath={this.props.routePathStore!.routePath!}
                                            isEditingDisabled={isEditingDisabled}
                                        />
                                    </ContentItem>
                                </ContentList>
                            </Tabs>
                        )}
                        {routePathStore!.isCompareRoutePathsContainerVisible ? (
                            <SaveButton
                                onClick={() => {
                                    if (
                                        routePathStore!.isRoutePathLengthFormedByMeasuredLengths()
                                    ) {
                                        this.showSavePrompt();
                                    } else {
                                        this.showUnmeasuredStopGapsPrompt(this.showSavePrompt);
                                    }
                                }}
                                disabled={savePreventedNotification.length > 0}
                                savePreventedNotification={savePreventedNotification}
                                type={
                                    savePreventedNotification.length > 0
                                        ? 'warningButton'
                                        : 'saveButton'
                                }
                                data-cy='routePathSaveButton'
                            >
                                {this.props.isNewRoutePath
                                    ? 'Luo reitinsuunta'
                                    : 'Tallenna muutokset'}
                            </SaveButton>
                        ) : (
                            <Button
                                onClick={this.openCompareRoutePathsContainer}
                                disabled={savePreventedNotification.length > 0}
                                hasPadding={true}
                            >
                                Vertaile muutoksia
                            </Button>
                        )}
                    </>
                )}
            </div>
        );
    }
}

export default RoutePathView;
