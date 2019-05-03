import React from 'react';
import Moment from 'moment';
import classnames from 'classnames';
import { observe } from 'mobx';
import { observer, inject } from 'mobx-react';
import { match } from 'react-router';
import ButtonType from '~/enums/buttonType';
import Button from '~/components/controls/Button';
import Loader, { LoaderSize } from '~/components/shared/loader/Loader';
import {
    RoutePathStore,
    RoutePathViewTab,
    ListFilter
} from '~/stores/routePathStore';
import { RoutePathCopySegmentStore } from '~/stores/routePathCopySegmentStore';
import { NetworkStore, NodeSize, MapLayer } from '~/stores/networkStore';
import { AlertStore } from '~/stores/alertStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import { ErrorStore } from '~/stores/errorStore';
import navigator from '~/routing/navigator';
import ViewFormBase from '~/components/shared/inheritedComponents/ViewFormBase';
import routePathValidationModel from '~/models/validationModels/routePathValidationModel';
import RouteService from '~/services/routeService';
import routeBuilder from '~/routing/routeBuilder';
import QueryParams from '~/routing/queryParams';
import SubSites from '~/routing/subSites';
import RoutePathService from '~/services/routePathService';
import LineService from '~/services/lineService';
import ToolbarTool from '~/enums/toolbarTool';
import EventManager from '~/util/EventManager';
import { validateRoutePathLinks } from '~/util/geomValidator';
import RoutePathFactory from '~/factories/routePathFactory';
import RoutePathInfoTab from './routePathInfoTab/RoutePathInfoTab';
import RoutePathLinksTab from './routePathListTab/RoutePathLinksTab';
import RoutePathTabs from './RoutePathTabs';
import RoutePathHeader from './RoutePathHeader';
import RoutePathCopySegmentView from './RoutePathCopySegmentView';
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
class RoutePathView extends ViewFormBase<
    IRoutePathViewProps,
    IRoutePathViewState
> {
    constructor(props: IRoutePathViewProps) {
        super(props);
        this.state = {
            isLoading: true,
            invalidPropertiesMap: {},
            isEditingDisabled: !props.isNewRoutePath
        };
    }

    componentDidMount() {
        super.componentDidMount();
        EventManager.on('undo', this.props.routePathStore!.undo);
        EventManager.on('redo', this.props.routePathStore!.redo);
        this.initialize();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
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
            observe(
                this.props.routePathStore!.routePath!.routePathLinks!,
                () => {
                    this.props.routePathStore!.onRoutePathLinksChanged();
                }
            );
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
                const route = await RouteService.fetchRoute(
                    queryParams[QueryParams.routeId]
                );
                // TODO: add transitType to this call (if transitType is routePath's property)
                const newRoutePath = RoutePathFactory.createNewRoutePath(
                    queryParams[QueryParams.lineId],
                    route
                );
                this.props.routePathStore!.setRoutePath(newRoutePath);
            } else {
                this.props.routePathStore!.setRoutePath(
                    RoutePathFactory.createNewRoutePathFromOld(
                        this.props.routePathStore!.routePath!
                    )
                );
            }
            this.props.toolbarStore!.selectTool(
                ToolbarTool.AddNewRoutePathLink
            );
        } catch (e) {
            this.props.errorStore!.addError(
                'Uuden reitinsuunnan luonti epäonnistui',
                e
            );
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
                this.props.networkStore!.setSelectedTransitTypes([
                    line.transitType!
                ]);
            } catch (e) {
                this.props.errorStore!.addError('Linjan haku epäonnistui', e);
            }
        }
    };

    private initExistingRoutePath = async () => {
        await this.fetchRoutePath();
        const itemToShow = navigator.getQueryParamValues()[
            QueryParams.showItem
        ];
        if (itemToShow) {
            this.props.routePathStore!.setActiveTab(RoutePathViewTab.List);
            this.props.routePathStore!.setExtendedListItems(itemToShow);
            this.props.routePathStore!.removeListFilter(ListFilter.link);
        }
    };

    private fetchRoutePath = async () => {
        const [
            routeId,
            startTimeString,
            direction
        ] = this.props.match!.params.id.split(',');
        const startTime = Moment(startTimeString);
        try {
            const routePath = await RoutePathService.fetchRoutePath(
                routeId,
                startTime,
                direction
            );
            this.props.routePathStore!.setRoutePath(routePath);
        } catch (e) {
            this.props.errorStore!.addError(
                'Reitinsuunnan haku ei onnistunut.',
                e
            );
        }
    };

    private onChange = (property: string) => (value: any) => {
        this.props.routePathStore!.updateRoutePathProperty(property, value);
        this.validateProperty(
            routePathValidationModel[property],
            property,
            value
        );
    };

    public renderTabContent = () => {
        if (this.props.routePathStore!.activeTab === RoutePathViewTab.Info) {
            return (
                <RoutePathInfoTab
                    isEditingDisabled={this.state.isEditingDisabled}
                    routePath={this.props.routePathStore!.routePath!}
                    isNewRoutePath={this.props.isNewRoutePath}
                    onChange={this.onChange}
                    invalidPropertiesMap={this.state.invalidPropertiesMap}
                />
            );
        }
        return (
            <RoutePathLinksTab
                routePath={this.props.routePathStore!.routePath!}
            />
        );
    };

    private save = async () => {
        this.setState({ isLoading: true });
        let redirectUrl: string | undefined;
        try {
            if (this.props.isNewRoutePath) {
                const routePathPrimaryKey = await RoutePathService.createRoutePath(
                    this.props.routePathStore!.routePath!
                );
                redirectUrl = routeBuilder
                    .to(SubSites.routePath)
                    .toTarget(
                        [
                            routePathPrimaryKey.routeId,
                            Moment(routePathPrimaryKey.startTime).format(
                                'YYYY-MM-DDTHH:mm:ss'
                            ),
                            routePathPrimaryKey.direction
                        ].join(',')
                    )
                    .toLink();
            } else {
                await RoutePathService.updateRoutePath(
                    this.props.routePathStore!.routePath!
                );
            }
            this.props.routePathStore!.setOldRoutePath(
                this.props.routePathStore!.routePath!
            );

            this.props.alertStore!.setFadeMessage('Tallennettu!');
        } catch (e) {
            this.props.errorStore!.addError(`Tallennus epäonnistui`, e);
        }
        this.setState({
            isEditingDisabled: true,
            invalidPropertiesMap: {},
            isLoading: false
        });
        if (redirectUrl) {
            navigator.goTo(redirectUrl);
        }
    };

    private toggleIsEditing = () => {
        const isEditingDisabled = this.state.isEditingDisabled;

        this.props.routePathStore!.setNeighborRoutePathLinks([]);
        if (!isEditingDisabled) {
            this.props.routePathStore!.undoChanges();
        }
        this.toggleIsEditingDisabled();
        if (!isEditingDisabled) this.validateRoutePath();
    };

    private validateRoutePath = () => {
        this.validateAllProperties(
            routePathValidationModel,
            this.props.routePathStore!.routePath
        );
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
            this.props.routePathStore!.routePath!.routePathLinks!
        );

        const isSaveButtonDisabled =
            this.state.isEditingDisabled ||
            !this.props.routePathStore!.isDirty ||
            !isGeometryValid ||
            !this.isFormValid();

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
                            {this.props.isNewRoutePath
                                ? 'Luo reitinsuunta'
                                : 'Tallenna muutokset'}
                        </Button>
                    </>
                )}
            </div>
        );
    }
}

export default RoutePathView;
