import * as React from 'react';
import moment from 'moment';
import Moment from 'react-moment';
import ButtonType from '~/enums/buttonType';
import Button from '~/components/controls/Button';
import { IRoutePath } from '~/models';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import RoutePathService from '~/services/routePathService';
import Loader from '~/components/shared/loader/Loader';
import NotificationStore from '~/stores/notificationStore';
import NotificationType from '~/enums/notificationType';
import ViewHeader from '../ViewHeader';
import RoutePathViewForm from './RoutePathViewForm';
import * as s from './routePathView.scss';

interface IRoutePathViewState {
    isEditingDisabled: boolean;
    isDirty: boolean;
    routePath: IRoutePath | null;
    isLoading: boolean;
}

interface IRoutePathViewProps {
}

class RoutePathView extends React.Component<IRoutePathViewProps, IRoutePathViewState>{
    constructor(props: any) {
        super(props);
        this.state = {
            isEditingDisabled: true,
            isDirty: false,
            routePath: null,
            isLoading: true,
        };
        this.save = this.save.bind(this);
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
        this.setState({
            routePath,
            isLoading: false,
        });
    }

    public toggleEditing = () => {
        const isEditingDisabled = !this.state.isEditingDisabled;
        this.setState({ isEditingDisabled });
    }

    public async save () {
        this.setState({ isLoading: true });
        try {
            await RoutePathService.saveRoutePath(this.state.routePath!);
            this.setState({ isDirty: false });
            NotificationStore.addNotification({
                message: 'Tallennus onnistui',
                type: NotificationType.SUCCESS,
            });
        } catch {
            NotificationStore.addNotification({
                message: 'Tallennus epäonnistui',
                type: NotificationType.ERROR,
            });
        }
        this.setState({ isLoading: false });
    }

    public onEdit = (property: string, value: any) => {
        this.setState({
            routePath: { ...this.state.routePath!, [property]: value },
            isDirty: true,
        });
    }

    public render(): any {
        if (this.state.isLoading) {
            return (
                <div className={s.routePathView}>
                    <Loader size={Loader.MEDIUM}/>
                </div>
            );
        }
        if (!this.state.routePath) return 'Error';
        return (
        <div className={s.routePathView}>
            <ViewHeader
                header={`Reitin suunta ${this.state.routePath.lineId}`}
            >
                <Button
                    onClick={this.toggleEditing}
                    type={ButtonType.SQUARE}
                    text={'Muokkaa'}
                />
            </ViewHeader>
            <div className={s.section} >
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
                        <div>{this.state.routePath.lineId}</div>
                    </div>
                    <div className={s.flexInnerColumn}>
                        <div>Päivityspvm</div>
                        <Moment
                            date={this.state.routePath.lastModified}
                            format='DD.MM.YYYY HH:mm'
                        />
                    </div>
                    <div className={s.flexInnerColumn}>
                        <div>Päivittää</div>
                        <div>{this.state.routePath.modifiedBy}</div>
                    </div>
                </div>
                <div className={s.sectionDivider} />
            </div>
            <div className={s.section}>
                <RoutePathViewForm
                    onEdit={this.onEdit}
                    isEditingDisabled={this.state.isEditingDisabled}
                    routePath={this.state.routePath}
                />
            </div>
            <div className={s.section}>
                <div className={s.flexRow}>
                    <Button
                        onClick={this.save}
                        type={ButtonType.SAVE}
                        text={'Tallenna reitinsuunta'}
                        disabled={!this.state.isDirty}
                    />
                </div>
            </div>
        </div>
        );
    }
}
export default RoutePathView;
