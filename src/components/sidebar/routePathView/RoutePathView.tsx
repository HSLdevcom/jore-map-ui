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
                    onClick={this.toggleEditing}
                    type={ButtonType.SQUARE}
                    text={'Muokkaa'}
                />
            </ViewHeader>
            <div className={s.routePathTimestamp}>01.09.2017</div>
            <div className={s.padding} />
            <div className={s.padding} />
            <div className={s.topic}>
                REITIN OTSIKKOTIEDOT
            </div>
            <div className={s.routeInformationContainer}>
                <div className={s.flexInnerColumn}>
                    <div>Reittitunnus</div>
                    <div>1016</div>
                </div>
                <div className={s.flexInnerColumn}>
                    <div>Linja</div>
                    <div>1016</div>
                </div>
                <div className={s.flexInnerColumn}>
                    <div>Päivityspvm</div>
                    <div>23.08.2017</div>
                </div>
                <div className={s.flexInnerColumn}>
                    <div>Päivittää</div>
                    <div>Vuori Tuomas</div>
                </div>
            </div>
            <div className={s.sectionDivider} />
            <RoutePathViewForm
                isEditingDisabled={this.state.isEditingDisabled}
            />
        </div>
        );
    }
}
export default RoutePathView;
