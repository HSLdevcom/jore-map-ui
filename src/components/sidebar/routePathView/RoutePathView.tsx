import * as React from 'react';
import ViewHeader from '../ViewHeader';
import RoutePathViewForm from './RoutePathViewForm';
import * as s from './routePathView.scss';

interface IRoutePathViewState {
    isEditingDisabled: boolean;
}

interface IRoutePathViewProps {
}

class RoutePathView extends React.Component<IRoutePathViewProps, IRoutePathViewState>{
    constructor(props: any) {
        super(props);
        this.state = {
            isEditingDisabled: true,
        };
    }

    public toggleEditing = () => {
        const isEditingDisabled = !this.state.isEditingDisabled;
        this.setState({ isEditingDisabled });
    }

    public render(): any {
        return (
        <div className={s.routePathView}>
            <ViewHeader
                header='Reitin suunta 1016'
                toggleEditing={this.toggleEditing}
                hideEditButton={false}
            />
            <RoutePathViewForm
                isEditingDisabled={this.state.isEditingDisabled}
            />
        </div>
        );
    }
}
export default RoutePathView;
