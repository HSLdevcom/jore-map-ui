import * as React from 'react';
import moment from 'moment';
import classnames from 'classnames';
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
    hasModifications: boolean;
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
            hasModifications: false,
            routePath: null,
            isLoading: true,
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
        this.setState({
            routePath,
            isLoading: false,
        });
    }

    public toggleEditing = () => {
        const isEditingDisabled = !this.state.isEditingDisabled;
        this.setState({ isEditingDisabled });
    }

    public save = async () => {
        this.setState({ isLoading: true });
        try {
            await RoutePathService.saveRoutePath(this.state.routePath!);
            this.setState({ hasModifications: false });
            NotificationStore.addNotification({
                message: 'Tallennus onnistui',
                type: NotificationType.SUCCESS,
            });
        } catch (err) {
            const errMessage = err.message ? `, (${err.message})` : '';
            NotificationStore.addNotification({
                message: `Tallennus epäonnistui${errMessage}`,
                type: NotificationType.ERROR,
            });
        }
        this.setState({ isLoading: false });
    }

    public onChange = (property: string, value: any) => {
        this.setState({
            routePath: { ...this.state.routePath!, [property]: value },
            hasModifications: true,
        });
    }

    public render(): any {
        // tslint:disable-next-line:max-line-length
        const message = 'Suunnalla on muutoksia, joita ei ole tallennettu. Oletko varma, että haluat poistaa näkymästä?';

        if (this.state.isLoading) {
            return (
                <div className={s.routePathView}>
                    <Loader size={Loader.MEDIUM}/>
                </div>
            );
        }
        if (!this.state.routePath) return 'Error';
        return (
        <div className={classnames(s.routePathView, s.form)}>
            <ViewHeader
                header={`Reitin suunta ${this.state.routePath.lineId}`}
                closePromptMessage={this.state.hasModifications ? message : undefined}
            >
                <Button
                    onClick={this.toggleEditing}
                    type={ButtonType.SQUARE}
                    text={this.state.isEditingDisabled ? 'Muokkaa' : 'Peruuta'}
                />
            </ViewHeader>
            <div className={s.routePathTimestamp}>01.09.2017</div>
            <div className={s.formSection}>
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
            </div>
            <div className={s.formSection}>
                <RoutePathViewForm
                    onChange={this.onChange}
                    isEditingDisabled={this.state.isEditingDisabled}
                    routePath={this.state.routePath}
                />
            </div>
            <div className={s.formSection}>
                <div className={s.flexRow}>
                    <Button
                        onClick={this.save}
                        type={ButtonType.SAVE}
                        text={'Tallenna reitinsuunta'}
                        disabled={!this.state.hasModifications}
                    />
                </div>
            </div>
        </div>
        );
    }
}
export default RoutePathView;
