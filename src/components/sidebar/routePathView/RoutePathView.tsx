import React from 'react';
import moment from 'moment';
import classnames from 'classnames';
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
import { NotificationStore } from '~/stores/notificationStore';
import RouteService from '~/services/routeService';
import RoutePathService from '~/services/routePathService';
import LineService from '~/services/lineService';
import NotificationType from '~/enums/notificationType';
import ToolbarTool from '~/enums/toolbarTool';
import RoutePathFactory from '~/factories/routePathFactory';
import RoutePathInfoTab from './routePathInfoTab/RoutePathInfoTab';
import RoutePathLinksTab from './routePathListTab/RoutePathLinksTab';
import RoutePathTabs from './RoutePathTabs';
import RoutePathHeader from './RoutePathHeader';
import * as s from './routePathView.scss';

interface IRoutePathViewState {
    isLoading: boolean;
    invalidFieldsMap: object;
    isEditingDisabled: boolean;
}

interface IRoutePathViewProps {
    routePathStore?: RoutePathStore;
    routeStore?: RouteStore;
    networkStore?: NetworkStore;
    notificationStore?: NotificationStore;
    toolbarStore?: ToolbarStore;
    match?: match<any>;
    isNewRoutePath: boolean;
}

@inject('routeStore', 'routePathStore', 'networkStore', 'notificationStore', 'toolbarStore')
@observer
class RoutePathView extends React.Component<IRoutePathViewProps, IRoutePathViewState>{
    constructor(props: IRoutePathViewProps) {
        super(props);
        this.state = {
            isLoading: true,
            invalidFieldsMap: {},
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
        this.setState({
            isLoading: false,
        });
    }

    componentWillUnmount() {
        this.props.toolbarStore!.selectTool(null);
        this.props.networkStore!.setNodeSize(NodeSize.normal);
        this.props.routePathStore!.clear();
    }

    private initializeAsAddingNew = async () => {
        if (!this.props.routePathStore!.routePath) {
            this.props.routePathStore!.setRoutePath(await this.createNewRoutePath());
        } else {
            this.props.routePathStore!.setRoutePath(
                RoutePathFactory.createNewRoutePathFromOld(this.props.routePathStore!.routePath!));
        }
        this.props.toolbarStore!.selectTool(ToolbarTool.AddNewRoutePathLink);
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
        if (!route) throw new Error(`Route not found, routeId: ${queryParams.routeId}`);

        return RoutePathFactory.createNewRoutePath(queryParams.lineId, route);
    }

    private setTransitType = async () => {
        const routePath = this.props.routePathStore!.routePath;
        if (routePath && routePath.lineId) {
            const line = await LineService.fetchLine(routePath.lineId);
            if (line) {
                this.props.networkStore!.setSelectedTransitTypes([line.transitType]);
            }
        }
    }

    private fetchRoutePath = async () => {
        const [routeId, startTimeString, direction] = this.props.match!.params.id.split(',');
        const startTime = moment(startTimeString);
        const routePath =
            await RoutePathService.fetchRoutePath(routeId, startTime, direction);
        if (!routePath) throw new Error(`RoutePath not found, routeId: ${routeId} startTime: ${startTime} direction: ${direction}`); /* tslint:disable max-line-length */
        this.props.routePathStore!.setRoutePath(routePath);
    }

    private markInvalidFields = (field: string, isValid: boolean) => {
        const invalidFieldsMap = this.state.invalidFieldsMap;
        invalidFieldsMap[field] = isValid;
        this.setState({
            invalidFieldsMap,
        });
    }

    private toggleIsEditingDisabled = () => {
        if (!this.state.isEditingDisabled) {
            this.props.routePathStore!.undoChanges();
        }
        const isEditingDisabled = !this.state.isEditingDisabled;
        this.setState({
            isEditingDisabled,
            invalidFieldsMap: {},
        });
    }

    public renderTabContent = () => {
        if (this.props.routePathStore!.activeTab === RoutePathViewTab.Info) {
            return (
                <RoutePathInfoTab
                    isEditingDisabled={this.state.isEditingDisabled}
                    routePath={this.props.routePathStore!.routePath!}
                    markInvalidFields={this.markInvalidFields}
                    toggleIsEditingDisabled={this.toggleIsEditingDisabled}
                />
            );
        }
        return (
            <RoutePathLinksTab
                routePath={this.props.routePathStore!.routePath!}
            />
        );
    }

    private isFormValid = () => {
        return !Object.values(this.state.invalidFieldsMap)
            .some(fieldIsValid => !fieldIsValid);
    }

    private save = async () => {
        this.setState({ isLoading: true });
        try {
            if (this.routePathIsNew()) {
                await RoutePathService.createRoutePath(this.props.routePathStore!.routePath!);
            } else {
                await RoutePathService.updateRoutePath(this.props.routePathStore!.routePath!);
            }
            this.props.routePathStore!.setRoutePath(this.props.routePathStore!.routePath!);

            this.props.notificationStore!.addNotification({
                message: 'Tallennus onnistui',
                type: NotificationType.SUCCESS,
            });
        } catch (err) {
            const errMessage = err.message ? `, (${err.message})` : '';
            this.props.notificationStore!.addNotification({
                message: `Tallennus epäonnistui${errMessage}`,
                type: NotificationType.ERROR,
            });
        }
        this.setState({
            isEditingDisabled: true,
            invalidFieldsMap: {},
            isLoading: false,
        });
    }

    private routePathIsNew = () => {
        return this.props.isNewRoutePath;
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
                    routePath={this.props.routePathStore!.routePath!}
                    isNewRoutePath={this.props.isNewRoutePath}
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
                    {this.routePathIsNew() ? 'Luo reitinsuunta' : 'Tallenna muutokset'}
                </Button>
            </div>
        );
    }
}

export default RoutePathView;
