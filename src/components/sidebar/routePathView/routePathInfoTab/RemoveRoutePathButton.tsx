import { inject, observer } from 'mobx-react';
import React from 'react';
import RouteActiveSchedules from '~/components/shared/RouteActiveSchedules';
import SaveButton from '~/components/shared/SaveButton';
import constants from '~/constants/constants';
import { IRoutePath } from '~/models';
import ISchedule from '~/models/ISchedule';
import RoutePathService from '~/services/routePathService';
import ScheduleService from '~/services/scheduleService';
import { AlertStore } from '~/stores/alertStore';
import { ConfirmStore } from '~/stores/confirmStore';
import { ErrorStore } from '~/stores/errorStore';
import { RoutePathStore } from '~/stores/routePathStore';
import NavigationUtils from '~/utils/NavigationUtils';
import { toDateString, toMidnightDate } from '~/utils/dateUtils';
import * as s from './removeRoutePathButton.scss';

interface IRemoveRoutePathButtonProps {
    routePathStore?: RoutePathStore;
    alertStore?: AlertStore;
    confirmStore?: ConfirmStore;
    errorStore?: ErrorStore;
}

const ENVIRONMENT = constants.ENVIRONMENT;

@inject('routePathStore', 'alertStore', 'confirmStore', 'errorStore')
@observer
class RemoveRoutePathButton extends React.Component<IRemoveRoutePathButtonProps> {
    private removeRoutePath = async () => {
        const activeSchedules: ISchedule[] = await ScheduleService.fetchActiveSchedules(
            this.props.routePathStore!.routePath?.routeId!
        );
        const routePath = this.props.routePathStore!.routePath!;
        this.props.confirmStore!.openConfirm({
            content: this.renderConfirmContent(routePath, activeSchedules),
            onConfirm: async () => {
                try {
                    this.props.alertStore!.setLoaderMessage('Reitinsuuntaa poistetaan...');
                    await RoutePathService.removeRoutePath({
                        routeId: routePath.routeId,
                        direction: routePath.direction,
                        startDate: routePath.startDate,
                    });
                    this.props.alertStore!.setFadeMessage({ message: 'Reitinsuunta poistettu!' });
                    NavigationUtils.openRouteView({
                        routeId: routePath.routeId,
                    });
                } catch (e) {
                    this.props.alertStore!.close();
                    this.props.errorStore!.addError(`Tallennus epäonnistui`, e);
                }
            },
            confirmButtonText: 'Poista reitinsuunta',
            confirmType: 'delete',
        });
    };
    private renderConfirmContent = (routePath: IRoutePath, activeSchedules: ISchedule[]) => {
        let confirmMessage;
        if (activeSchedules.length > 0) {
            confirmMessage = `Oletko täysin varma, että haluat poistaa `;
        } else {
            confirmMessage = `Haluatko varmasti poistaa `;
        }
        confirmMessage += `reitinsuunnan ${routePath.originFi} - ${
            routePath.destinationFi
        }, suunta ${routePath.direction}, ${toDateString(routePath.startDate)} - ${toDateString(
            routePath.endDate
        )}?`;

        const routeId = this.props.routePathStore!.routePath?.routeId!;
        return (
            <div>
                <div className={s.routeActiveSchedulesWrapper}>
                    <RouteActiveSchedules
                        header={routeId}
                        routePaths={this.props.routePathStore!.existingRoutePaths}
                        activeSchedules={activeSchedules}
                        confirmMessage={confirmMessage}
                    />
                </div>
            </div>
        );
    };
    render() {
        const routePathStore = this.props.routePathStore!;
        const routePath = routePathStore.routePath!;
        const isEditingDisabled = routePathStore.isEditingDisabled;

        const currentDatePlusOne = toMidnightDate(new Date());
        currentDatePlusOne.setDate(currentDatePlusOne.getDate() + 1);
        const isRoutePathInFuture = routePath.startDate.getTime() >= currentDatePlusOne.getTime();
        const isSaveAllowed = ENVIRONMENT !== 'prod' && ENVIRONMENT !== 'stage';
        const savePreventedNotification = isSaveAllowed
            ? ''
            : 'Reitinsuunnan poistaminen ei ole vielä valmis. Voit kokeilla poistamista dev-ympäristössä. Jos haluat poistaa reitinsuuntia tuotannossa, joudut käyttämään vanhaa JORE-ympäristöä.';
        return (
            <SaveButton
                className={
                    (s.removeButton, !isRoutePathInFuture ? s.disabledHoverButton : undefined)
                }
                disabled={isEditingDisabled}
                savePreventedNotification={savePreventedNotification}
                type='deleteButton'
                onClick={isRoutePathInFuture ? this.removeRoutePath : () => void 0}
                isWide={false}
                hasPadding={false}
                title={
                    !isRoutePathInFuture
                        ? 'Vain tulevaisuudessa olevia reitinsuuntia voi poistaa.'
                        : ''
                }
                data-cy='removeRoutePathButton'
            >
                Poista reitinsuunta
            </SaveButton>
        );
    }
}

export default RemoveRoutePathButton;
