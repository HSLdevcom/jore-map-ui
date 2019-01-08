import * as React from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import Moment from 'react-moment';
import ButtonType from '~/enums/buttonType';
import Button from '~/components/controls/Button';
import { IRoutePath } from '~/models';
import RoutePathService from '~/services/routePathService';
import { NotificationStore } from '~/stores/notificationStore';
import NotificationType from '~/enums/notificationType';
import { RoutePathStore } from '~/stores/routePathStore';
import { IValidationResult } from '~/validation/FormValidator';
import navigator from '~/routing/navigator';
import routeBuilder from '~/routing/routeBuilder';
import subSites from '~/routing/subSites';
import ViewHeader from '../ViewHeader';
import RoutePathViewForm from './RoutePathViewForm';
import * as s from './routePathTab.scss';

interface IRoutePathViewState {
    isEditingDisabled: boolean;
    invalidFieldsMap: object;
    isLoading: boolean;
}

interface IRoutePathViewProps {
    routePathStore?: RoutePathStore;
    notificationStore?: NotificationStore;
    routePath: IRoutePath;
}

@inject('routePathStore', 'notificationStore')
@observer
class RoutePathTab extends React.Component<IRoutePathViewProps, IRoutePathViewState>{
    constructor(props: any) {
        super(props);
        this.state = {
            isEditingDisabled: true,
            invalidFieldsMap: {},
            isLoading: true,
        };
    }

    public toggleEditing = () => {
        const isEditingDisabled = !this.state.isEditingDisabled;
        this.setState({ isEditingDisabled });
    }

    public save = async () => {
        this.setState({ isLoading: true });
        try {
            await RoutePathService.updateRoutePath(this.props.routePathStore!.routePath!);
            this.props.routePathStore!.resetHaveLocalModifications();
            this.props.notificationStore!.addNotification({
                message: 'Tallennus onnistui',
                type: NotificationType.SUCCESS,
            });
        } catch (err) {
            const errMessage = err.message ? `, (${err.message})` : '';
            this.props.notificationStore!.addNotification({
                message: `Tallennus epäonnistui${errMessage}`,
                type: NotificationType.ERROR,
            });
        }
        this.setState({ isLoading: false });
    }

    private markInvalidFields = (field: string, isValid: boolean) => {
        this.setState({
            invalidFieldsMap: {
                ...this.state.invalidFieldsMap,
                [field]: isValid,
            },
        });
    }

    private isFormValid = () => {
        return !Object.values(this.state.invalidFieldsMap)
            .some(fieldIsValid => !fieldIsValid);
    }

    public onChange = (property: string, value: any, validationResult?: IValidationResult) => {
        this.props.routePathStore!.updateRoutePathProperty(property, value);
        if (validationResult) {
            this.markInvalidFields(property, validationResult!.isValid);
        }
    }

    private redirectToNewRoutePathView = () => {
        const routePath = this.props.routePathStore!.routePath;
        if (!routePath) return;

        const newRoutePathLink = routeBuilder
        .to(subSites.newRoutePath, { routeId: routePath.routeId, lineId: routePath.lineId })
        .toLink();

        navigator.goTo(newRoutePathLink);
    }

    public render() {
        // tslint:disable-next-line:max-line-length
        const message = 'Reitin suunnalla tallentamattomia muutoksia. Oletko varma, että poistua näkymästä? Tallentamattomat muutokset kumotaan.';
        const routePath = this.props.routePathStore!.routePath;

        if (!routePath) return 'Error';
        return (
        <div className={classnames(s.routePathTab, s.form)}>
            <div className={s.formSection}>
                <ViewHeader
                    header={`Reitinsuunta`}
                    closePromptMessage={
                        this.props.routePathStore!.hasUnsavedModifications ? message : undefined
                    }
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
                        <div>{routePath.routeId}</div>
                    </div>
                    <div className={s.flexInnerColumn}>
                        <div>Linja</div>
                        <div>{routePath.lineId}</div>
                    </div>
                    <div className={s.flexInnerColumn}>
                        <div>Päivityspvm</div>
                        <Moment
                            date={routePath.lastModified}
                            format='DD.MM.YYYY HH:mm'
                        />
                    </div>
                    <div className={s.flexInnerColumn}>
                        <div>Päivittäjä</div>
                        <div>{routePath.modifiedBy}</div>
                    </div>
                </div>
            </div>
            <div className={s.formSection}>
                <RoutePathViewForm
                    onChange={this.onChange}
                    isEditingDisabled={this.state.isEditingDisabled}
                    routePath={routePath}
                />
            </div>
            <div className={s.formSection}>
                <div className={s.flexRow}>
                    <Button
                        onClick={this.save}
                        type={ButtonType.SAVE}
                        text={'Tallenna reitinsuunta'}
                        disabled={
                            !this.props.routePathStore!.hasUnsavedModifications
                            || !this.isFormValid()
                        }
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
export default RoutePathTab;
