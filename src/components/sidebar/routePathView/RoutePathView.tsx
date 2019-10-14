import classnames from 'classnames';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import Moment from 'moment';
import React from 'react';
import { match } from 'react-router';
import Button from '~/components/controls/Button';
import ViewFormBase from '~/components/shared/inheritedComponents/ViewFormBase';
import Loader, { LoaderSize } from '~/components/shared/loader/Loader';
import ButtonType from '~/enums/buttonType';
import ToolbarTool from '~/enums/toolbarTool';
import RoutePathFactory from '~/factories/routePathFactory';
import { IRoutePath, IRoutePathLink, IViaName } from '~/models';
import routePathValidationModel from '~/models/validationModels/routePathValidationModel';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import LineService from '~/services/lineService';
import RoutePathService from '~/services/routePathService';
import RouteService from '~/services/routeService';
import ViaNameService from '~/services/viaNameService';
import { AlertStore } from '~/stores/alertStore';
import { ErrorStore } from '~/stores/errorStore';
import { MapLayer, NetworkStore, NodeSize } from '~/stores/networkStore';
import { RoutePathCopySegmentStore } from '~/stores/routePathCopySegmentStore';
import { ListFilter, RoutePathStore, RoutePathViewTab } from '~/stores/routePathStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import EventManager from '~/util/EventManager';
import { validateRoutePathLinks } from '~/util/geomValidator';
import RoutePathCopySegmentView from './RoutePathCopySegmentView';
import RoutePathHeader from './RoutePathHeader';
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
    AlertStore?: AlertStore;
    match?: match<any>;
    isNewRoutePath: boolean;
}

interface IRoutePathViewState {
    isLoading: boolean;
    invalidPropertiesMap: object;
    isEditingDisabled: boolean;
}

@inject(
    'routePathStore',
    'routePathCopySegmentStore',
    'networkStore',
    'toolbarStore',
    'errorStore',
    'alertStore'
)
@observer
class RoutePathView extends ViewFormBase<IRoutePathViewProps, IRoutePathViewState> {
    constructor(props: IRoutePathViewProps) {
        super(props);
        this.state = {
            isLoading: true,
            invalidPropertiesMap: {},
            isEditingDisabled: !props.isNewRoutePath
        };
    }

    componentDidMount() {
        EventManager.on('undo', this.props.routePathStore!.undo);
        EventManager.on('redo', this.props.routePathStore!.redo);
        this.initialize();
    }

    componentWillUnmount() {
        this.props.toolbarStore!.selectTool(null);
        this.props.networkStore!.setNodeSize(NodeSize.normal);
        this.props.routePathStore!.clear();
        EventManager.off('undo', this.props.routePathStore!.undo);
        EventManager.off('redo', this.props.routePathStore!.redo);
    }

    private initialize = async () => {
        if (this.props.isNewRoutePath) {
            await this.createNewRoutePath();
        } else {
            await this.initExistingRoutePath();
        }
        await this.initializeMap();
        if (this.props.routePathStore!.routePath) {
            this.validateRoutePath();
            this.setState({
                isLoading: false
            });
        }
    };

    private createNewRoutePath = async () => {
        try {
            if (!this.props.routePathStore!.routePath) {
                const queryParams = navigator.getQueryParamValues();
                const routeId = queryParams[QueryParams.routeId];
                const lineId = queryParams[QueryParams.lineId];
                const route = await RouteService.fetchRoute(routeId);
                const newRoutePath = RoutePathFactory.createNewRoutePath(lineId, route);
                this.props.routePathStore!.init(newRoutePath, []);
            } else {
                this.props.routePathStore!.init(
                    RoutePathFactory.createNewRoutePathFromOld(
                        this.props.routePathStore!.routePath!
                    ),
                    []
                );
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
            const viaNames = await this.fetchViaNames(routePath);
            this.props.routePathStore!.init(routePath, viaNames);
        } catch (e) {
            this.props.errorStore!.addError('Reitinsuunnan haku ei onnistunut.', e);
        }
    };

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
                        if (viaName) viaNames.push(viaName);
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

    private onChangeRoutePathProperty = (property: keyof IRoutePath) => (value: any) => {
        this.props.routePathStore!.updateRoutePathProperty(property, value);
        this.validateProperty(routePathValidationModel[property], property, value);
    };

    public renderTabContent = () => {
        if (this.props.routePathStore!.activeTab === RoutePathViewTab.Info) {
            return (
                <RoutePathInfoTab
                    isEditingDisabled={this.state.isEditingDisabled}
                    routePath={this.props.routePathStore!.routePath!}
                    isNewRoutePath={this.props.isNewRoutePath}
                    onChangeRoutePathProperty={this.onChangeRoutePathProperty}
                    invalidPropertiesMap={this.state.invalidPropertiesMap}
                    setValidatorResult={this.setValidatorResult}
                />
            );
        }
        return (
            <RoutePathLinksTab
                routePath={this.props.routePathStore!.routePath!}
                isEditingDisabled={this.state.isEditingDisabled}
            />
        );
    };

    private save = async () => {
        this.setState({ isLoading: true });
        let redirectUrl: string | undefined;
        const routePath = this.props.routePathStore!.routePath;
        try {
            if (this.props.isNewRoutePath) {
                const viaNames = this.props.routePathStore!.viaNames;
                const routePathPrimaryKey = await RoutePathService.createRoutePath(
                    routePath!,
                    viaNames
                );
                redirectUrl = routeBuilder
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
                const viaNames = this.props.routePathStore!.viaNames;
                await RoutePathService.updateRoutePath(routePathToUpdate, viaNames);
            }
            this.props.alertStore!.setFadeMessage('Tallennettu!');
        } catch (e) {
            this.props.errorStore!.addError(`Tallennus epäonnistui`, e);
        }
        if (redirectUrl) {
            navigator.goTo(redirectUrl);
        }
        await this.fetchRoutePath();
        this.setState({
            isEditingDisabled: true,
            invalidPropertiesMap: {},
            isLoading: false
        });
    };

    private toggleIsEditing = () => {
        const isEditingDisabled = this.state.isEditingDisabled;

        this.props.routePathStore!.setNeighborRoutePathLinks([]);
        if (!isEditingDisabled) {
            this.props.routePathStore!.resetChanges();
        }
        this.toggleIsEditingDisabled();
        if (!isEditingDisabled) this.validateRoutePath();
    };

    private validateRoutePath = () => {
        this.validateAllProperties(routePathValidationModel, this.props.routePathStore!.routePath);
    };

    render() {
        if (this.state.isLoading) {
            return (
                <div className={classnames(s.routePathView, s.loaderContainer)}>
                    <Loader size={LoaderSize.MEDIUM} />
                </div>
            );
        }
        if (!this.props.routePathStore!.routePath) return null;

        const isGeometryValid = validateRoutePathLinks(
            this.props.routePathStore!.routePath!.routePathLinks
        );

        const areLinkFormsValid = this.props.routePathStore!.invalidLinkOrderNumbers.length === 0;
        // TODO:
        // are nodeFormsValid ...
        const isSaveButtonDisabled =
            this.state.isEditingDisabled ||
            !this.props.routePathStore!.isDirty ||
            !isGeometryValid ||
            !this.isFormValid() ||
            !areLinkFormsValid;

        const copySegmentStore = this.props.routePathCopySegmentStore;

        const isCopyRoutePathSegmentViewVisible =
            copySegmentStore!.startNode && copySegmentStore!.endNode;

        return (
            <div className={s.routePathView}>
                <RoutePathHeader
                    hasModifications={this.props.routePathStore!.isDirty}
                    routePath={this.props.routePathStore!.routePath!}
                    isNewRoutePath={this.props.isNewRoutePath}
                    isEditing={!this.state.isEditingDisabled}
                    onEditButtonClick={this.toggleIsEditing}
                />
                {isCopyRoutePathSegmentViewVisible ? (
                    <RoutePathCopySegmentView />
                ) : (
                    <>
                        <div>
                            <RoutePathTabs />
                        </div>
                        {this.renderTabContent()}
                        <Button
                            onClick={this.save}
                            type={ButtonType.SAVE}
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
