import * as React from 'react';
import ButtonType from '~/enums/buttonType';
import Button from '~/components/controls/Button';
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
            isEditingDisabled: false,
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
            >
                <Button
                    className={s.editButton}
                    onClick={this.toggleEditing}
                    type={ButtonType.SQUARE}
                    text={'Muokkaa'}
                />
            </ViewHeader>
            <RoutePathViewForm
                isEditingDisabled={this.state.isEditingDisabled}
            />
        </div>
        );
    }
}
export default RoutePathView;
