import * as React from 'react';
import moment from 'moment';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import Moment from 'react-moment';
import { match } from 'react-router';
import ButtonType from '~/enums/buttonType';
import Button from '~/components/controls/Button';
import { IRoutePath } from '~/models';
import navigator from '~/routing/navigator';
import routeBuilder from '~/routing/routeBuilder';
import subSites from '~/routing/subSites';
import RoutePathService from '~/services/routePathService';
import Loader from '~/components/shared/loader/Loader';
import { RoutePathStore } from '~/stores/routePathStore';
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
    routePathStore?: RoutePathStore;
    match?: match<any>;
}

@inject('routePathStore')
@observer
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
        const [routeId, startTimeString, direction] = this.props.match!.params.id.split(',');
        const startTime = moment(startTimeString);
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

    private redirectToNewRoutePathView = () => {
        const routePath = this.state.routePath;
        if (!routePath) return;

        const newRoutePathLink = routeBuilder
        .to(subSites.newRoutePath, { routeId: routePath.routeId, lineId: routePath.lineId })
        .toLink();

        this.props.routePathStore!.setRoutePath(this.state.routePath);
        navigator.goTo(newRoutePathLink);

    }

    public render(): any {
        // tslint:disable-next-line:max-line-length
        const message = 'Reitin suunnalla tallentamattomia muutoksia. Oletko varma, että poistua näkymästä? Tallentamattomat muutokset kumotaan.';

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
            <div className={s.formSection}>
                <ViewHeader
                    header={`Reitin suunta`}
                    closePromptMessage={this.state.hasModifications ? message : undefined}
                >
                    <Button
                        onClick={this.toggleEditing}
                        type={ButtonType.SQUARE}
                        text={this.state.isEditingDisabled ? 'Muokkaa' : 'Peruuta'}
                    />
                </ViewHeader>
            </div>
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
                        <div>Päivittäjä</div>
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
            <Button
                onClick={this.redirectToNewRoutePathView}
                type={ButtonType.SQUARE}
                text={`Luo uusi reitin suunta käyttäen tätä pohjana`}
            />
        </div>
        );
    }
}
export default RoutePathView;
