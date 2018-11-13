import { inject, observer } from 'mobx-react';
import * as React from 'react';
import classnames from 'classnames';
import { IRoutePath } from '~/models';
import { Button } from '~/components/controls';
import ButtonType from '~/enums/buttonType';
import { MapStore, NodeSize } from '~/stores/mapStore';
import { NetworkStore } from '~/stores/networkStore';
import { RoutePathStore } from '~/stores/routePathStore';
import RoutePathFactory from '~/factories/routePathFactory';
import ViewHeader from '../ViewHeader';
import RoutePathViewForm from './RoutePathViewForm';
import * as s from './routePathView.scss';

interface INewRoutePathViewProps {
    mapStore?: MapStore;
    routePathStore?: RoutePathStore;
    networkStore?: NetworkStore;
}

@inject('mapStore', 'routePathStore', 'networkStore')
@observer
class NewRoutePathView extends React.Component<INewRoutePathViewProps>{
    initialRoutePath: IRoutePath;

    constructor(props: any) {
        super(props);
        this.initialRoutePath = this.getInitialRoutePath();

         // TODO: call this when newRoutePath button is clicked
        const newRoutePath = RoutePathFactory.createNewRoutePath('1', '1');
        this.props.routePathStore!.setRoutePath(newRoutePath);
    }

    // TODO: Use routePath store instead of state
    // TODO, this is just a placeholder, implement real logic for creating new routePaths
    private getInitialRoutePath = () => {
        const newRoutePath: IRoutePath = {
            internalId: '',
            routeId: '',
            routePathName: 'Uusi reitinsuunta',
            routePathNameSw: 'Ny ruttriktning',
            direction: '1',
            positions: [[0, 0]],
            geoJson: null,
            visible: true,
            startTime: new Date,
            endTime: new Date,
            lastModified: new Date,
            routePathLinks: [],
            originFi: '',
            originSw: '',
            destinationFi: '',
            destinationSw: '',
            routePathShortName: '',
            routePathShortNameSw: '',
            modifiedBy: '',
        };
        return newRoutePath;
    }

    // TODO
    public onChange = () => {
    }

    // TODO
    public onSave = () => {

    }

    componentDidMount() {
        this.props.mapStore!.setNodeSize(NodeSize.large);

        this.props.networkStore!.setIsNodesVisible(true);
        this.props.networkStore!.setIsLinksVisible(true);

        this.props.routePathStore!.setIsCreating(true);
    }

    componentWillUnmount() {
        this.props.mapStore!.setNodeSize(NodeSize.normal);
        this.props.routePathStore!.setIsCreating(false);

    }

    public render(): any {
        return (
        <div className={classnames(s.routePathView, s.form)}>
            <div className={s.formSection}>
                <ViewHeader
                    header='Luo uusi reitinsuunta'
                />
            </div>
            <div className={s.formSection}>
                <RoutePathViewForm
                    isEditingDisabled={false}
                    onChange={this.onChange}
                    routePath={this.initialRoutePath}
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
