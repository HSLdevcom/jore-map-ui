import { inject, observer } from 'mobx-react';
import * as React from 'react';
import classnames from 'classnames';
import { IRoutePath } from '~/models';
import { Button } from '~/components/controls';
import ButtonType from '~/enums/buttonType';
import navigator from '~/routing/navigator';
import LineService from '~/services/lineService';
import { MapStore, NodeSize } from '~/stores/mapStore';
import { NetworkStore } from '~/stores/networkStore';
import { RoutePathStore } from '~/stores/routePathStore';
import { RouteStore } from '~/stores/routeStore';
import RoutePathFactory from '~/factories/routePathFactory';
import RoutePathService from '~/services/routePathService';
import NotificationStore from '~/stores/notificationStore';
import NotificationType from '~/enums/notificationType';
import ViewHeader from '../ViewHeader';
import RoutePathViewForm from './RoutePathViewForm';
import * as s from './routePathView.scss';

interface INewRoutePathViewProps {
    mapStore?: MapStore;
    routeStore?: RouteStore;
    routePathStore?: RoutePathStore;
    networkStore?: NetworkStore;
}

interface INewRoutePathViewState {
    isLoading: boolean;
}

@inject('mapStore', 'routeStore', 'routePathStore', 'networkStore')
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

        this.initStores(newRoutepath);
    }

    createNewRoutePath() {
        const queryParams = navigator.getQueryParamValues();
        // TODO: add transitType to this call (if transitType is routePath's property)
        return RoutePathFactory.createNewRoutePath(queryParams.lineId, queryParams.routeId);
    }

    private initStores(routePath: IRoutePath|null) {
        this.props.mapStore!.setNodeSize(NodeSize.large);
        this.props.networkStore!.setNodeVisibility(true);
        this.props.networkStore!.setLinkVisibility(true);
        this.props.routePathStore!.setIsCreating(true);
        this.props.routeStore!.clearRoutes();

        if (routePath) {
            this.setTransitType(routePath);
        }
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
            NotificationStore.addNotification({
                message: 'Tallennus onnistui',
                type: NotificationType.SUCCESS,
            });
        } catch (err) {
            const errMessage = err.message ? `, (${err.message})` : '';
            NotificationStore.addNotification({
                message: `Tallennus epäonnistui${errMessage}`,
                type: NotificationType.ERROR,
            });
        }
        this.setState({ isLoading: false });
    }

    public onChange = (property: string, value: string) => {
        this.props.routePathStore!.updateRoutePathField(property, value);
    }

    private isSaveDisabled = () => {
        return !this.props.routePathStore!.routePath
            || this.props.routePathStore!.routePath!.routePathLinks!.length === 0;
    }

    componentWillUnmount() {
        this.props.mapStore!.setNodeSize(NodeSize.normal);
        this.props.routePathStore!.setIsCreating(false);
        this.props.routePathStore!.setRoutePath(null);
    }

    public render(): any {
        if (this.state.isLoading) return 'Loading';
        if (!this.props.routePathStore!.routePath) return 'Error';
        const routePath = this.props.routePathStore!.routePath!;
        return (
        <div className={classnames(s.routePathView, s.form)}>
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
        );
    }
}
export default NewRoutePathView;
