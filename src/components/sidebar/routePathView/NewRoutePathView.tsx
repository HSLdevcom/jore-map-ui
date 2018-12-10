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
import ViewHeader from '../ViewHeader';
import RoutePathViewForm from './RoutePathViewForm';
import * as s from './routePathViewTab.scss';

interface INewRoutePathViewProps {
    mapStore?: MapStore;
    routeStore?: RouteStore;
    routePathStore?: RoutePathStore;
    networkStore?: NetworkStore;
}

interface INewRoutePathViewState {
    currentRoutePath: IRoutePath;
}

@inject('mapStore', 'routeStore', 'routePathStore', 'networkStore')
@observer
class NewRoutePathView extends React.Component<INewRoutePathViewProps, INewRoutePathViewState>{
    constructor(props: any) {
        super(props);

        const routePathStore = this.props.routePathStore;
        const currentRoutePath = routePathStore ? routePathStore.routePath : null;
        if (!currentRoutePath) {
            const newRoutePath = this.createNewRoutePath();

            this.props.routePathStore!.setRoutePath(newRoutePath);
            this.state = {
                currentRoutePath: newRoutePath,
            };
        } else {
            this.state = {
                currentRoutePath,
            };
        }

        this.initStores(currentRoutePath);
    }

    createNewRoutePath() {
        const queryParams = navigator.getQueryParamValues();
        // TODO: add transitType to this call (if transitType is routePath's property)
        return RoutePathFactory.createNewRoutePath(queryParams.lineId, queryParams.routeId);
    }

    private initStores(currentRoutePath: IRoutePath|null) {
        this.props.mapStore!.setNodeSize(NodeSize.large);
        this.props.networkStore!.setNodeVisibility(true);
        this.props.networkStore!.setLinkVisibility(true);
        this.props.routePathStore!.setIsCreating(true);
        this.props.routeStore!.clearRoutes();

        if (currentRoutePath) {
            this.setTransitType(currentRoutePath);
        }
    }

    // TODO: transitType could be routePath's property
    // then we wouldn't need to fetch transitType from line
    private async setTransitType(currentRoutePath: IRoutePath) {
        if (currentRoutePath.lineId) {
            const line = await LineService.fetchLine(currentRoutePath.lineId);
            if (line) {
                this.props.networkStore!.setSelectedTransitTypes([line.transitType]);
            }
        }
    }

    public onChange = (property: string, value: string) => {
        this.setState({
            currentRoutePath: { ...this.state.currentRoutePath!, [property]: value },
        });
    }

    public onSave = () => {
        // TODO
    }

    componentWillUnmount() {
        this.props.mapStore!.setNodeSize(NodeSize.normal);
        this.props.routePathStore!.setIsCreating(false);
        this.props.routePathStore!.setRoutePath(null);
    }

    public render(): any {
        const currentRoutePath = this.state.currentRoutePath;
        return (
        <div className={classnames(s.routePathViewTab, s.form)}>
            <div className={s.formSection}>
                <ViewHeader
                    header='Luo uusi reitinsuunta'
                />
                <div className={s.flexInnerRow}>
                    <div className={s.staticInfo}>LINJA: {currentRoutePath.lineId}</div>
                    <div className={s.staticInfo}>REITTI: {currentRoutePath.routeId}</div>
                </div>
            </div>
            <div className={s.formSection}>
                <RoutePathViewForm
                    isEditingDisabled={false}
                    onChange={this.onChange}
                    routePath={currentRoutePath}
                />
            </div>
            <div className={s.formSection}>
                <div className={s.flexRow}>
                    <Button
                        onClick={this.onSave}
                        type={ButtonType.SAVE}
                        text={'Tallenna reitinsuunta'}
                    />
                </div>
            </div>
        </div>
        );
    }
}
export default NewRoutePathView;
