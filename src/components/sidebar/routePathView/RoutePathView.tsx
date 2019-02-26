import React from 'react';
import moment from 'moment';
import classnames from 'classnames';
import { observe } from 'mobx';
import { observer, inject } from 'mobx-react';
import { match } from 'react-router';
import ButtonType from '~/enums/buttonType';
import Button from '~/components/controls/Button';
import Loader, { LoaderSize } from '~/components/shared/loader/Loader';
import { RoutePathStore, RoutePathViewTab } from '~/stores/routePathStore';
import navigator from '~/routing/navigator';
import { RouteStore } from '~/stores/routeStore';
import { NetworkStore, NodeSize, MapLayer } from '~/stores/networkStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import ViewFormBase from '~/components/shared/inheritedComponents/ViewFormBase';
import DialogStore from '~/stores/dialogStore';
import RouteService from '~/services/routeService';
import RoutePathService from '~/services/routePathService';
import LineService from '~/services/lineService';
import { ErrorStore } from '~/stores/errorStore';
import ToolbarTool from '~/enums/toolbarTool';
import EventManager from '~/util/EventManager';
import RoutePathFactory from '~/factories/routePathFactory';
import RoutePathInfoTab from './routePathInfoTab/RoutePathInfoTab';
import RoutePathLinksTab from './routePathListTab/RoutePathLinksTab';
import RoutePathTabs from './RoutePathTabs';
import RoutePathHeader from './RoutePathHeader';
import * as s from './routePathView.scss';

interface IRoutePathViewState {
    isLoading: boolean;
    invalidPropertiesMap: object;
    isEditingDisabled: boolean;
}

interface IRoutePathViewProps {
    errorStore?: ErrorStore;
    routePathStore?: RoutePathStore;
    routeStore?: RouteStore;
    networkStore?: NetworkStore;
    toolbarStore?: ToolbarStore;
    match?: match<any>;
    isNewRoutePath: boolean;
}

@inject('routeStore', 'routePathStore', 'networkStore', 'toolbarStore', 'errorStore')
@observer
class RoutePathView extends ViewFormBase<IRoutePathViewProps, IRoutePathViewState>{
    constructor(props: IRoutePathViewProps) {
        super(props);
        this.state = {
            isLoading: true,
            invalidPropertiesMap: {},
            isEditingDisabled: true,
        };
    }

    async componentDidMount() {
        if (this.props.isNewRoutePath) {
            await this.initializeAsAddingNew();
        } else {
            await this.fetchRoutePath();
        }
        await this.initializeMap();
        this.props.routeStore!.clearRoutes();
        EventManager.on('undo', () => this.props.routePathStore!.undo());
        EventManager.on('redo', () => this.props.routePathStore!.redo());
        observe(
            this.props.routePathStore!.routePath!.routePathLinks!,
            () => {
                this.props.routePathStore!.onRoutePathLinksChanged();
            },
        );
        this.setState({
            isLoading: false,
        });
    }

    componentWillUnmount() {
        this.props.toolbarStore!.selectTool(null);
        this.props.networkStore!.setNodeSize(NodeSize.normal);
        this.props.routePathStore!.clear();
        EventManager.off('undo', () => this.props.routePathStore!.undo());
        EventManager.off('redo', () => this.props.routePathStore!.redo());
    }

    private initializeAsAddingNew = async () => {
        try {
            if (!this.props.routePathStore!.routePath) {
                this.props.routePathStore!.setRoutePath(await this.createNewRoutePath());
            } else {
                this.props.routePathStore!.setRoutePath(
                    RoutePathFactory.createNewRoutePathFromOld(
                        this.props.routePathStore!.routePath!,
                    ),
                );
            }
            this.props.toolbarStore!.selectTool(ToolbarTool.AddNewRoutePathLink);
        } catch (ex) {
            this.props.errorStore!.addError('Reittisuunnan uuden luonti epäonnistui');
        }
    }

    private initializeMap = async () => {
        if (this.props.isNewRoutePath) {
            this.props.networkStore!.setNodeSize(NodeSize.large);
            this.props.networkStore!.showMapLayer(MapLayer.node);
            this.props.networkStore!.showMapLayer(MapLayer.link);
        }

        await this.setTransitType();
    }

    private createNewRoutePath = async () => {
        const queryParams = navigator.getQueryParamValues();
        const route = await RouteService.fetchRoute(queryParams.routeId);
        // TODO: add transitType to this call (if transitType is routePath's property)

        return RoutePathFactory.createNewRoutePath(queryParams.lineId, route);
    }

    private setTransitType = async () => {
        const routePath = this.props.routePathStore!.routePath;
        if (routePath && routePath.lineId) {
            try {
                const line = await LineService.fetchLine(routePath.lineId);
                this.props.networkStore!.setSelectedTransitTypes([line.transitType]);
            } catch (ex) {
                this.props.errorStore!.addError('Linjan haku ei onnistunut');
            }
        }
    }

    private fetchRoutePath = async () => {
        const [routeId, startTimeString, direction] = this.props.match!.params.id.split(',');
        const startTime = moment(startTimeString);
        try {
            const routePath =
                await RoutePathService.fetchRoutePath(routeId, startTime, direction);
            this.props.routePathStore!.setRoutePath(routePath);
        } catch (ex) {
            this.props.errorStore!.addError('Reitinsuunnan haku ei onnistunut.');
        }
    }

    public renderTabContent = () => {
        if (this.props.routePathStore!.activeTab === RoutePathViewTab.Info) {
            return (
                <RoutePathInfoTab
                    isEditingDisabled={this.state.isEditingDisabled}
                    routePath={this.props.routePathStore!.routePath!}
                    markInvalidProperties={this.markInvalidProperties}
                    isNewRoutePath={this.props.isNewRoutePath}
                />
            );
        }
        return (
            <RoutePathLinksTab
                routePath={this.props.routePathStore!.routePath!}
            />
        );
    }

    private save = async () => {
        this.setState({ isLoading: true });
        try {
            if (this.props.isNewRoutePath) {
                await RoutePathService.createRoutePath(this.props.routePathStore!.routePath!);
            } else {
                await RoutePathService.updateRoutePath(this.props.routePathStore!.routePath!);
            }
            this.props.routePathStore!.setOldRoutePath(this.props.routePathStore!.routePath!);

            DialogStore.setFadeMessage('Tallennettu!');
        } catch (err) {
            const errMessage = err.message ? `, (${err.message})` : '';
            this.props.errorStore!.addError(`Tallennus epäonnistui${errMessage}`);
        }
        this.setState({
            isEditingDisabled: true,
            invalidPropertiesMap: {},
            isLoading: false,
        });
    }

    private toggleIsEditing = () => {
        this.toggleIsEditingDisabled(
            this.props.routePathStore!.undoChanges,
        );
    }

    render() {
        if (this.state.isLoading) {
            return (
                <div className={classnames(s.routePathView, s.loaderContainer)}>
                    <Loader size={LoaderSize.MEDIUM}/>
                </div>
            );
        }
        if (!this.props.routePathStore!.routePath) return null;

        const isSaveButtonDisabled = this.state.isEditingDisabled
            || !this.props.routePathStore!.isDirty
            || !this.props.routePathStore!.isGeometryValid
            || !this.isFormValid();

        return (
            <div className={s.routePathView}>
                <RoutePathHeader
                    hasModifications={this.props.routePathStore!.isDirty}
                    routePath={this.props.routePathStore!.routePath!}
                    isNewRoutePath={this.props.isNewRoutePath}
                    isEditing={!this.state.isEditingDisabled}
                    onEditButtonClick={this.toggleIsEditing}
                />
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
            </div>
        );
    }
}

export default RoutePathView;
