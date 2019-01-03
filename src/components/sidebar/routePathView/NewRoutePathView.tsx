import { inject, observer } from 'mobx-react';
import * as React from 'react';
import classnames from 'classnames';
import { IRoutePath } from '~/models';
import { Button } from '~/components/controls';
import ButtonType from '~/enums/buttonType';
import ToolbarTool from '~/enums/toolbarTool';
import navigator from '~/routing/navigator';
import LineService from '~/services/lineService';
import { NetworkStore, NodeSize, MapLayer } from '~/stores/networkStore';
import { RoutePathStore } from '~/stores/routePathStore';
import { RouteStore } from '~/stores/routeStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import RoutePathFactory from '~/factories/routePathFactory';
import RoutePathService from '~/services/routePathService';
import { NotificationStore } from '~/stores/notificationStore';
import NotificationType from '~/enums/notificationType';
import Loader from '~/components/shared/loader/Loader';
import ViewHeader from '../ViewHeader';
import RoutePathViewForm from './routePathInfoTab/RoutePathViewForm';
import * as s from './routePathView.scss';

interface INewRoutePathViewProps {
    notificationStore?: NotificationStore;
    routePathStore?: RoutePathStore;
    routeStore?: RouteStore;
    networkStore?: NetworkStore;
    toolbarStore?:  ToolbarStore;
}

interface INewRoutePathViewState {
    isLoading: boolean;
}

@inject('routeStore', 'routePathStore', 'networkStore', 'toolbarStore', 'notificationStore')
@observer
class NewRoutePathView extends React.Component<INewRoutePathViewProps, INewRoutePathViewState>{
    constructor(props: any) {
        super(props);

        const oldRoutePath = this.props.routePathStore!.routePath;
        let newRoutepath: IRoutePath;
        if (!oldRoutePath) {
            newRoutepath = this.createNewRoutePath();
        } else {
            newRoutepath = RoutePathFactory.createNewRoutePathFromOld(oldRoutePath);
        }
        this.props.routePathStore!.setRoutePath(newRoutepath);

        this.state = {
            isLoading: false,
        };

        this.initStores();
        if (newRoutepath) {
            this.setTransitType(newRoutepath);
        }
    }

    createNewRoutePath() {
        const queryParams = navigator.getQueryParamValues();
        // TODO: add transitType to this call (if transitType is routePath's property)
        return RoutePathFactory.createNewRoutePath(queryParams.lineId, queryParams.routeId);
    }

    initStores() {
        this.props.toolbarStore!.selectTool(ToolbarTool.AddNewRoutePath);
        this.props.networkStore!.setNodeSize(NodeSize.large);
        this.props.networkStore!.showMapLayer(MapLayer.node);
        this.props.networkStore!.showMapLayer(MapLayer.link);
        this.props.routePathStore!.setIsCreating(true);
        this.props.routeStore!.clearRoutes();
    }

    // TODO: transitType could be routePath's property
    // then we wouldn't need to fetch transitType from line
    private async setTransitType(routePath: IRoutePath) {
        if (routePath.lineId) {
            const line = await LineService.fetchLine(routePath.lineId);
            if (line) {
                this.props.networkStore!.setSelectedTransitTypes([line.transitType]);
            }
        }
    }

    public onSave = async () => {
        this.setState({ isLoading: true });
        try {
            await RoutePathService.createRoutePath(this.props.routePathStore!.routePath!);
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
        this.setState({ isLoading: false });
    }

    componentWillUnmount() {
        this.props.toolbarStore!.selectTool(null);
        this.props.networkStore!.setNodeSize(NodeSize.normal);
        this.props.routePathStore!.setIsCreating(false);
        this.props.routePathStore!.setRoutePath(null);
    }

    public onChange = (property: string, value: string) => {
        this.props.routePathStore!.updateRoutePathProperty(property, value);
    }

    private isSaveDisabled = () => {
        return !this.props.routePathStore!.routePath
            || this.props.routePathStore!.routePath!.routePathLinks!.length === 0;
    }

    public render(): any {
        if (this.state.isLoading) {
            return (
                <Loader size={Loader.MEDIUM}/>
            );
        }
        const routePath = this.props.routePathStore!.routePath!;
        return (
        <div className={s.routePathView}>
            <div className={classnames(s.content, s.form)}>
                <div className={s.formSection}>
                    <ViewHeader
                        header='Luo uusi reitinsuunta'
                    />
                    <div className={s.flexInnerRow}>
                        <div className={s.staticInfo}>LINJA: {routePath.lineId}</div>
                        <div className={s.staticInfo}>REITTI: {routePath.routeId}</div>
                    </div>
                </div>
                <div className={s.formSection}>
                    <RoutePathViewForm
                        isEditingDisabled={false}
                        onChange={this.onChange}
                        routePath={routePath}
                    />
                </div>
                <div className={s.formSection}>
                    <div className={s.flexRow}>
                        <Button
                            onClick={this.onSave}
                            type={ButtonType.SAVE}
                            disabled={this.isSaveDisabled()}
                            text={'Tallenna reitinsuunta'}
                        />
                    </div>
                </div>
            </div>
        </div>
        );
    }
}
export default NewRoutePathView;
