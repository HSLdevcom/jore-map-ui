import { inject, observer } from 'mobx-react';
import * as React from 'react';
import classnames from 'classnames';
import { IRoutePath } from '~/models';
import { Button } from '~/components/controls';
import ButtonType from '~/enums/buttonType';
import navigator from '~/routing/navigator';
import { MapStore, NodeSize } from '~/stores/mapStore';
import { NetworkStore } from '~/stores/networkStore';
import { RoutePathStore } from '~/stores/routePathStore';
import { RouteStore } from '~/stores/routeStore';
import RoutePathFactory from '~/factories/routePathFactory';
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
    currentRoutePath?: IRoutePath;
}

@inject('mapStore', 'routeStore', 'routePathStore', 'networkStore')
@observer
class NewRoutePathView extends React.Component<INewRoutePathViewProps, INewRoutePathViewState>{
    currentRoutePath: IRoutePath;

    constructor(props: any) {
        super(props);

        this.state = {
            currentRoutePath: undefined,
        };
    }

    public onChange = (property: string) => (value: string) => {
        this.setState({
            currentRoutePath: { ...this.state.currentRoutePath!, [property]: value },
        });
    }

    public onSave = () => {
        // TODO
    }

    componentWillMount() {
        if (!this.props.routePathStore!.routePath) {
            this.initEmptyRoutePath();
        }
    }

    initEmptyRoutePath() {
        const queryParams = navigator.getQueryParamValues();
        const newRoutePath =
            RoutePathFactory.createNewRoutePath(queryParams.lineId, queryParams.routeId);

        this.props.routePathStore!.setRoutePath(newRoutePath);
    }

    componentDidMount() {
        this.initStores();
        this.initCurrentRoutePath();
    }

    private initStores() {
        this.props.mapStore!.setNodeSize(NodeSize.large);
        this.props.networkStore!.setIsNodesVisible(true);
        this.props.networkStore!.setIsLinksVisible(true);
        this.props.routePathStore!.setIsCreating(true);
    }

    private initCurrentRoutePath() {
        // TODO: this should be action call
        this.props.routeStore!.routes = [];

        if (!this.state.currentRoutePath) {
            const currentRoutePath = this.props.routePathStore!.routePath;
            this.setState({
                currentRoutePath:  currentRoutePath ? currentRoutePath : undefined,
            });
        }
    }

    componentWillUnmount() {
        this.props.mapStore!.setNodeSize(NodeSize.normal);
        this.props.routePathStore!.setIsCreating(false);
        this.props.routePathStore!.setRoutePath(null);
    }

    public render(): any {
        const currentRoutePath = this.state.currentRoutePath;
        if (!currentRoutePath) {
            return null;
        }

        return (
        <div className={classnames(s.routePathView, s.form)}>
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
