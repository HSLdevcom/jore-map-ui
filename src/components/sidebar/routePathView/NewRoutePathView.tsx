import * as React from 'react';
import { IRoutePath } from '~/models';
import ViewHeader from '../ViewHeader';
import RoutePathViewForm from './RoutePathViewForm';
import * as s from './routePathView.scss';

class NewRoutePathView extends React.Component{
    initialRoutePath: IRoutePath;

    constructor(props: any) {
        super(props);
        this.initialRoutePath = this.getInitialRoutePath();
    }

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

    public componentDidMount() {
        this.initialRoutePath = this.getInitialRoutePath();
    }

    public render(): any {
        return (
        <div className={s.routePathView}>
            <ViewHeader
                header='Luo uusi reitinsuunta'
            />
            <RoutePathViewForm
                isEditingDisabled={false}
                onEdit={this.onChange}
                routePath={this.initialRoutePath}
            />
            <div>
                <div className={s.sectionDivider} />
            </div>
        </div>
        );
    }
}
export default NewRoutePathView;
