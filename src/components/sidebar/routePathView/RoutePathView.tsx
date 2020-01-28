import L from 'leaflet';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import Moment from 'moment';
import React from 'react';
import ReactMoment from 'react-moment';
import { match } from 'react-router';
import Button from '~/components/controls/Button';
import SavePrompt, { ISaveModel } from '~/components/overlays/SavePrompt';
import Loader from '~/components/shared/loader/Loader';
import constants from '~/constants/constants';
import ButtonType from '~/enums/buttonType';
import ToolbarTool from '~/enums/toolbarTool';
import RoutePathFactory from '~/factories/routePathFactory';
import EventHelper from '~/helpers/EventHelper';
import { IRoutePath, IRoutePathLink, IViaName } from '~/models';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import LineService from '~/services/lineService';
import RoutePathService from '~/services/routePathService';
import ViaNameService from '~/services/viaNameService';
import { AlertStore } from '~/stores/alertStore';
import { ConfirmStore } from '~/stores/confirmStore';
import { ErrorStore } from '~/stores/errorStore';
import { MapStore } from '~/stores/mapStore';
import { MapLayer, NetworkStore, NodeSize } from '~/stores/networkStore';
import { RoutePathCopySegmentStore } from '~/stores/routePathCopySegmentStore';
import { ListFilter, RoutePathStore, RoutePathViewTab } from '~/stores/routePathStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import NavigationUtils from '~/utils/NavigationUtils';
import { validateRoutePathLinks } from '~/utils/geomUtils';
import SidebarHeader from '../SidebarHeader';
import RoutePathCopySegmentView from './RoutePathCopySegmentView';
import RoutePathTabs from './RoutePathTabs';
import RoutePathInfoTab from './routePathInfoTab/RoutePathInfoTab';
import RoutePathLinksTab from './routePathListTab/RoutePathLinksTab';
import * as s from './routePathView.scss';

interface IRoutePathViewProps {
    alertStore?: AlertStore;
    routePathStore?: RoutePathStore;
    routePathCopySegmentStore?: RoutePathCopySegmentStore;
    networkStore?: NetworkStore;
    toolbarStore?: ToolbarStore;
    errorStore?: ErrorStore;
    mapStore?: MapStore;
    confirmStore?: ConfirmStore;
    match?: match<any>;
    isNewRoutePath: boolean;
}

interface IRoutePathViewState {
    isLoading: boolean;
}

const ENVIRONMENT = constants.ENVIRONMENT;

@inject(
    'routePathStore',
    'routePathCopySegmentStore',
    'networkStore',
    'toolbarStore',
    'errorStore',
    'alertStore',
    'mapStore',
    'confirmStore'
)
@observer
class RoutePathView extends React.Component<IRoutePathViewProps, IRoutePathViewState> {
    constructor(props: IRoutePathViewProps) {
        super(props);
        this.state = {
            isLoading: true
        };
    }

    componentDidMount() {
        EventHelper.on('undo', this.props.routePathStore!.undo);
        EventHelper.on('redo', this.props.routePathStore!.redo);
        this.initialize();
        this.props.routePathStore!.setIsEditingDisabled(!this.props.isNewRoutePath);
    }

    componentWillUnmount() {
        this.props.toolbarStore!.selectTool(null);
        this.props.networkStore!.setNodeSize(NodeSize.normal);
        this.props.routePathStore!.clear();
        EventHelper.off('undo', this.props.routePathStore!.undo);
        EventHelper.off('redo', this.props.routePathStore!.redo);
    }

    private initialize = async () => {
        await this.fetchExistingPrimaryKeys();
        if (this.props.isNewRoutePath) {
            await this.createNewRoutePath();
        } else {
            await this.initExistingRoutePath();
        }
        await this.initializeMap();
        if (this.props.routePathStore!.routePath) {
            this.setState({
                isLoading: false
            });
        }
    };

    private fetchExistingPrimaryKeys = async () => {
        const queryParams = navigator.getQueryParamValues();
        const routeId = queryParams[QueryParams.routeId];
        const routePathPrimaryKeys = await RoutePathService.fetchAllRoutePathPrimaryKeys(routeId);
        this.props.routePathStore!.setExistingRoutePathPrimaryKeys(routePathPrimaryKeys);
    }

    private createNewRoutePath = async () => {
        this.props.mapStore!.initCoordinates();
        try {
            if (!this.props.routePathStore!.routePath) {
                const queryParams = navigator.getQueryParamValues();
                const routeId = queryParams[QueryParams.routeId];
                const lineId = queryParams[QueryParams.lineId];
                const line = await LineService.fetchLine(lineId);
                const routePath = RoutePathFactory.createNewRoutePath(lineId, routeId, line.transitType!);
                this.props.routePathStore!.init({ routePath, isNewRoutePath: this.props.isNewRoutePath });
            } else {
                this.props.routePathStore!.init({
                    routePath: RoutePathFactory.createNewRoutePathFromOld(
                        this.props.routePathStore!.routePath!
                    ),
                    isNewRoutePath: this.props.isNewRoutePath
                });
            }
            this.props.toolbarStore!.selectTool(ToolbarTool.AddNewRoutePathLink);
        } catch (e) {
            this.props.errorStore!.addError('Uuden reitinsuunnan luonti epäonnistui', e);
        }
    };

    private initializeMap = async () => {
        if (this.props.isNewRoutePath) {
            this.props.networkStore!.setNodeSize(NodeSize.large);
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
        await this.fetchRoutePath();
        const itemToShow = navigator.getQueryParamValues()[QueryParams.showItem];
        if (itemToShow) {
            this.props.routePathStore!.setActiveTab(RoutePathViewTab.List);
            this.props.routePathStore!.setExtendedListItems(itemToShow);
            this.props.routePathStore!.removeListFilter(ListFilter.link);
        }
    };

    private fetchRoutePath = async () => {
        this.setState({ isLoading: true });
        const [routeId, startTimeString, direction] = this.props.match!.params.id.split(',');
        try {
            const routePath = await RoutePathService.fetchRoutePath(
                routeId,
                startTimeString,
                direction
            );
            await this.fetchViaNames(routePath);
            this.centerMapToRoutePath(routePath);
            this.props.routePathStore!.init({ routePath, isNewRoutePath: this.props.isNewRoutePath });
        } catch (e) {
            this.props.errorStore!.addError('Reitinsuunnan haku ei onnistunut.', e);
        }
    };

    // fetch & set viaName properties to routePathLink
    private fetchViaNames = async (routePath: IRoutePath) => {
        try {
            const routePathLinks: IRoutePathLink[] = routePath.routePathLinks;
            const promises: Promise<void>[] = [];
            const viaNames: IViaName[] = [];

            routePathLinks.forEach((routePathLink: IRoutePathLink) => {
                const createPromise = async () => {
                    try {
                        const viaName: IViaName | null = await ViaNameService.fetchViaName(
                            routePathLink.id
                        );
                        routePathLink.viaNameId = routePathLink.id;
                        routePathLink.destinationFi1 = viaName?.destinationFi1;
                        routePathLink.destinationFi2 = viaName?.destinationFi2;
                        routePathLink.destinationSw1 = viaName?.destinationSw1;
                        routePathLink.destinationSw2 = viaName?.destinationSw2;
                    } catch (err) {
                        this.props.errorStore!.addError(
                            'Määränpää tietojen (via nimet) haku ei onnistunut.',
                            err
                        );
                    }
                };

                promises.push(createPromise());
            });

            await Promise.all(promises);
            return viaNames;
        } catch (err) {
            this.props.errorStore!.addError(
                'Määränpää tietojen (via nimet) haku ei onnistunut.',
                err
            );
        }
        return [];
    };

    private centerMapToRoutePath = (routePath: IRoutePath) => {
        const bounds: L.LatLngBounds = new L.LatLngBounds([]);

        routePath!.routePathLinks.forEach(link => {
            link.geometry.forEach(pos => bounds.extend(pos));
        });

        this.props.mapStore!.setMapBounds(bounds);
    };

    public renderTabContent = () => {
        const isEditingDisabled = this.props.routePathStore!.isEditingDisabled;
        if (this.props.routePathStore!.activeTab === RoutePathViewTab.Info) {
            return (
                <RoutePathInfoTab
                    isEditingDisabled={isEditingDisabled}
                    routePath={this.props.routePathStore!.routePath!}
                    invalidPropertiesMap={this.props.routePathStore!.invalidPropertiesMap}
                />
            );
        }
        return (
            <RoutePathLinksTab
                routePath={this.props.routePathStore!.routePath!}
                isEditingDisabled={isEditingDisabled}
            />
        );
    };

    private save = async () => {
        this.setState({ isLoading: true });
        let routePathViewLink: string | undefined;
        const routePath = this.props.routePathStore!.routePath;
        try {
            if (this.props.isNewRoutePath) {
                const routePathPrimaryKey = await RoutePathService.createRoutePath(
                    routePath!
                );
                routePathViewLink = routeBuilder
                    .to(SubSites.routePath)
                    .toTarget(
                        ':id',
                        [
                            routePathPrimaryKey.routeId,
                            Moment(routePathPrimaryKey.startTime).format('YYYY-MM-DDTHH:mm:ss'),
                            routePathPrimaryKey.direction
                        ].join(',')
                    )
                    .toLink();
            } else {
                const routePathToUpdate = _.cloneDeep(routePath!);
                const hasRoutePathLinksChanged = this.props.routePathStore!.hasRoutePathLinksChanged();

                // If routePathLinks are not changed, no need to update them (optimizing save time in backend)
                if (!hasRoutePathLinksChanged) {
                    routePathToUpdate.routePathLinks = [];
                }
                await RoutePathService.updateRoutePath(routePathToUpdate);
            }
            this.props.alertStore!.setFadeMessage({ message: 'Tallennettu!' });
        } catch (e) {
            this.props.errorStore!.addError(`Tallennus epäonnistui`, e);
        }
        if (routePathViewLink) {
            navigator.goTo({ link: routePathViewLink, shouldSkipUnsavedChangesPrompt: true });
            return;
        }
        await this.fetchRoutePath();
        this.setState({
            isLoading: false
        });
        this.props.routePathStore!.setIsEditingDisabled(true);
    };

    private showSavePrompt = () => {
        const confirmStore = this.props.confirmStore;
        const currentRoutePath = this.props.routePathStore!.routePath;
        const oldRoutePath = this.props.routePathStore!.oldRoutePath;
        const saveModel: ISaveModel = {
            type: 'saveModel',
            newData: currentRoutePath ? currentRoutePath : {},
            oldData: oldRoutePath,
            model: 'routePath'
        };
        confirmStore!.openConfirm({
            content: <SavePrompt models={[saveModel]} />,
            onConfirm: () => {
                this.save();
            }
        });
    };

    private showSavePreventedAlert = () => {
        this.props.alertStore!.setNotificationMessage({ message: 'Reitinsuunnan tallentaminen ei ole vielä valmis. Voit kokeilla tallentamista dev-ympäristössä. Jos haluat tallentaa reitinsuuntia tuotannossa, joudut käyttämään vanhaa JORE-ympäristöä.' });
    }

    render() {
        const routePathStore = this.props.routePathStore;
        if (this.state.isLoading) {
            return (
                <div className={s.routePathView}><Loader size='medium' /></div>
            );
        }
        const routePath = routePathStore!.routePath;
        if (!routePath) return null;

        const isGeometryValid = validateRoutePathLinks(routePath.routePathLinks);
        const isEditingDisabled = routePathStore!.isEditingDisabled;
        const isSaveButtonDisabled =
            isEditingDisabled ||
            !this.props.routePathStore!.isDirty ||
            !isGeometryValid ||
            !this.props.routePathStore!.isFormValid;
        const copySegmentStore = this.props.routePathCopySegmentStore;
        const isCopyRoutePathSegmentViewVisible =
            copySegmentStore!.startNode && copySegmentStore!.endNode;
        const isSavingPrevented = ENVIRONMENT === 'prod' || ENVIRONMENT === 'stage';
        return (
            <div className={s.routePathView} data-cy='routePathView'>
                <div className={s.sidebarHeaderSection}>
                    <SidebarHeader
                        isEditButtonVisible={!this.props.isNewRoutePath}
                        onEditButtonClick={routePathStore!.toggleIsEditingDisabled}
                        isEditing={!routePathStore!.isEditingDisabled}
                    >
                        {this.props.isNewRoutePath
                            ? 'Uusi reitinsuunta'
                            :
                            <div className={s.topic}>
                                <div className={s.link} title={`Avaa linkki ${routePath.lineId}`} onClick={() => NavigationUtils.openLineView(routePath.lineId)}>{routePath.lineId}</div>
                                <div>&nbsp;>&nbsp;</div>
                                <div className={s.link} title={`Avaa reitti ${routePath.routeId}`} onClick={() => NavigationUtils.openRouteView(routePath.routeId)}>{routePath.routeId}</div>
                            </div>
                        }
                    </SidebarHeader>
                    <div className={s.subTopic}>
                        <ReactMoment date={routePath.startTime} format='DD.MM.YYYY' /> - <ReactMoment date={routePath.endTime} format='DD.MM.YYYY' />
                        < br />
                        Suunta {routePath.direction}: {routePath.originFi} - {routePath.destinationFi}
                    </div>
                </div>

                {isCopyRoutePathSegmentViewVisible ? (
                    <RoutePathCopySegmentView />
                ) : (
                    <>
                        <div>
                            <RoutePathTabs />
                        </div>
                        {this.renderTabContent()}
                        <Button
                            onClick={isSavingPrevented ? this.showSavePreventedAlert : this.showSavePrompt}
                            type={isSavingPrevented ? ButtonType.WARNING : ButtonType.SAVE}
                            disabled={isSaveButtonDisabled}
                        >
                            {this.props.isNewRoutePath ? 'Luo reitinsuunta' : 'Tallenna muutokset'}
                        </Button>
                    </>
                )}
            </div>
        );
    }
}

export default RoutePathView;
