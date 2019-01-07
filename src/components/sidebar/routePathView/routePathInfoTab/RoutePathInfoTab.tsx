import * as React from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import { FiEdit, FiCopy } from 'react-icons/fi';
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
import RoutePathViewForm from './RoutePathViewForm';
import * as s from './routePathInfoTab.scss';

interface IRoutePathViewState {
    isEditingDisabled: boolean;
    hasModifications: boolean;
    invalidFieldsMap: object;
    isLoading: boolean;
    routePath: IRoutePath;
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
            hasModifications: false,
            invalidFieldsMap: {},
            isLoading: true,
            routePath: this.props.routePath,
        };
    }

    public toggleEditing = () => {
        const isEditingDisabled = !this.state.isEditingDisabled;
        this.setState({ isEditingDisabled });
    }

    public save = async () => {
        this.setState({ isLoading: true });
        try {
            await RoutePathService.updateRoutePath(this.state.routePath!);
            this.setState({ hasModifications: false });
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
        this.setState({
            routePath: { ...this.state.routePath!, [property]: value },
            hasModifications: true,
        });
        if (validationResult) {
            this.markInvalidFields(property, validationResult!.isValid);
        }
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
        if (!this.state.routePath) return 'Error';
        return (
        <div className={classnames(s.routePathTab, s.form)}>
            <div className={s.routePathTabActions}>
                <Button
                    type={ButtonType.ROUND}
                    onClick={this.toggleEditing!}
                >
                    <FiEdit
                        className={this.state.isEditingDisabled ? 'asd' : 'asd'}
                    />
                    { this.state.isEditingDisabled &&
                        'Muokkaa'
                    }
                    { !this.state.isEditingDisabled &&
                        'Peruuta'
                    }
                </Button>
                <Button
                    type={ButtonType.ROUND}
                    onClick={this.redirectToNewRoutePathView!}
                >
                    <FiCopy />
                    Kopio
                </Button>
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
                        disabled={!this.state.hasModifications || !this.isFormValid()}
                    >
                        Tallenna reitinsuunta
                    </Button>
                </div>
            </div>
        </div>
        );
    }
}
export default RoutePathTab;
