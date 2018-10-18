import * as React from 'react';
import moment from 'moment';
import Moment from 'react-moment';
import ButtonType from '~/enums/buttonType';
import Button from '~/components/controls/Button';
import { IRoutePath } from '~/models';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import RoutePathService from '~/services/routePathService';
import ViewHeader from '../ViewHeader';
import RoutePathViewForm from './RoutePathViewForm';
import * as s from './routePathView.scss';

interface IRoutePathViewState {
    isEditingDisabled: boolean;
    isDirty: boolean;
    routePath: IRoutePath | null;
}

interface IRoutePathViewProps {
}

class RoutePathView extends React.Component<IRoutePathViewProps, IRoutePathViewState>{
    constructor(props: any) {
        super(props);
        this.state = {
            isEditingDisabled: false,
            isDirty: false,
            routePath: null,
        };
    }

    public componentDidMount() {
        this.fetchRoutePath();
    }

    private async fetchRoutePath() {
        const routeId = navigator.getQueryParam(QueryParams.routeId);
        const direction = navigator.getQueryParam(QueryParams.direction);
        const startTime = moment(
            decodeURIComponent(navigator.getQueryParam(QueryParams.startTime)));
        const routePath =
            await RoutePathService.fetchRoutePath(routeId, startTime, direction);
        this.setState({ routePath });
    }

    public toggleEditing = () => {
        const isEditingDisabled = !this.state.isEditingDisabled;
        this.setState({ isEditingDisabled });
    }

    public render(): any {
        if (!this.state.routePath) return 'loading';
        return (
        <div className={s.routePathView}>
            <ViewHeader
                header='Reitin suunta'
            >
                <Button
                    onClick={this.toggleEditing}
                    type={ButtonType.SQUARE}
                    text={'Muokkaa'}
                />
            </ViewHeader>
            <div className={s.routePathTimestamp}>
                <Moment
                    date={this.state.routePath.lastModified}
                    format='DD.MM.YYYY HH:mm'
                />
            </div>
            <div className={s.padding} />
            <div className={s.padding} />
            <div className={s.topic}>
                REITIN OTSIKKOTIEDOT
            </div>
            <div className={s.routeInformationContainer}>
                <div className={s.flexInnerColumn}>
                    <div>Reittitunnus</div>
                    <div>{this.state.routePath.routeId}</div>
                </div>
                <div className={s.flexInnerColumn}>
                    <div>Linja</div>
                    <div>?</div>
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
                routePath={this.state.routePath}
            />
        </div>
        );
    }
}
export default RoutePathView;
