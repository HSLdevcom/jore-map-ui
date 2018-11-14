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
    initialRoutePath?: IRoutePath;
}

@inject('mapStore', 'routeStore', 'routePathStore', 'networkStore')
@observer
class NewRoutePathView extends React.Component<INewRoutePathViewProps, INewRoutePathViewState>{
    initialRoutePath: IRoutePath;

    constructor(props: any) {
        super(props);

        //  // TODO: call this when newRoutePath button is clicked
        // const newRoutePath = RoutePathFactory.createNewRoutePath('1', '1');
        // this.props.routePathStore!.setRoutePath(newRoutePath);

        // this.initialRoutePath = newRoutePath;
        this.state = {
            initialRoutePath: undefined,
        };
    }

    // TODO
    public onChange = () => {
    }

    // TODO
    public onSave = () => {

    }

    componentWillMount() {
        // TODO
        if (!this.props.routePathStore!.routePath) {
            console.log('will mount if');
            const queryParams = navigator.getQueryParamValues();
            const newRoutePath =
                RoutePathFactory.createNewRoutePath(queryParams.lineId, queryParams.routeId);
            this.props.routePathStore!.setRoutePath(newRoutePath);
        } else {
            console.log('will mount else ', this.props.routePathStore!.routePath);
        }
    }

    componentDidMount() {
        this.props.mapStore!.setNodeSize(NodeSize.large);

        this.props.networkStore!.setIsNodesVisible(true);
        this.props.networkStore!.setIsLinksVisible(true);

        this.props.routePathStore!.setIsCreating(true);

        // TODO: this should be action call
        this.props.routeStore!.routes = [];

        if (!this.state.initialRoutePath) {
            //
        }
    }

    componentWillUnmount() {
        this.props.mapStore!.setNodeSize(NodeSize.normal);
        this.props.routePathStore!.setIsCreating(false);
        this.props.routePathStore!.setRoutePath(null);
    }

    public render(): any {
        const initialRoutePath = this.props.routePathStore!.routePath;
        if (!initialRoutePath) {
            console.log('initial RP was not found ');
            return null;
        }
        console.log('initial RP ', initialRoutePath);

        return (
        <div className={classnames(s.routePathView, s.form)}>
            <div className={s.formSection}>
                <ViewHeader
                    header='Luo uusi reitinsuunta'
                />
                <div className={s.flexInnerRow}>
                    <div className={s.staticInfo}>LINJA: {initialRoutePath.lineId}</div>
                    <div className={s.staticInfo}>REITTI: {initialRoutePath.routeId}</div>
                </div>
            </div>
            <div className={s.formSection}>
                <RoutePathViewForm
                    isEditingDisabled={false}
                    onChange={this.onChange}
                    routePath={initialRoutePath}
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
