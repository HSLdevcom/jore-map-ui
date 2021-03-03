import { inject, observer } from 'mobx-react';
import React from 'react';
import SaveButton from '~/components/shared/SaveButton';
import ISchedule from '~/models/ISchedule';
import RoutePathService from '~/services/routePathService';
import ScheduleService from '~/services/scheduleService';
import { AlertStore } from '~/stores/alertStore';
import { ConfirmStore } from '~/stores/confirmStore';
import { ErrorStore } from '~/stores/errorStore';
import { LoginStore } from '~/stores/loginStore';
import { RoutePathStore } from '~/stores/routePathStore';
import NavigationUtils from '~/utils/NavigationUtils';
import { toDateString, toMidnightDate } from '~/utils/dateUtils';
import * as s from './removeRoutePathButton.scss';

interface IRemoveRoutePathButtonProps {
    routePathStore?: RoutePathStore;
    alertStore?: AlertStore;
    confirmStore?: ConfirmStore;
    errorStore?: ErrorStore;
    loginStore?: LoginStore;
}

@inject('routePathStore', 'alertStore', 'confirmStore', 'errorStore', 'loginStore')
@observer
class RemoveRoutePathButton extends React.Component<IRemoveRoutePathButtonProps> {
    private removeRoutePath = async () => {
        const activeSchedules: ISchedule[] = await ScheduleService.fetchActiveSchedules(
            this.props.routePathStore!.routePath?.routeId!
        );
        const routePath = this.props.routePathStore!.routePath!;
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

        const routeId = routePath.routeId;
        const routePathsAfterRemove = this.props.routePathStore!.existingRoutePaths.filter((rp) => {
            const isRpToRemove =
                rp.startDate.getTime() === routePath.startDate.getTime() &&
                rp.direction === routePath.direction &&
                rp.routeId === routePath.routeId;
            return !isRpToRemove;
        });

        this.props.confirmStore!.openConfirm({
            confirmComponentName: 'removeRoutePathConfirm',
            confirmData: {
                routeId,
                activeSchedules,
                confirmMessage,
                routePaths: routePathsAfterRemove,
            },
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
                        shouldSkipUnsavedChangesPrompt: true,
                    });
                } catch (e) {
                    this.props.alertStore!.close();
                    this.props.errorStore!.addError('', e);
                }
            },
            confirmButtonText: 'Poista reitinsuunta',
            confirmType: 'delete',
        });
    };

    render() {
        if (!this.props.loginStore!.hasWriteAccess) return null;

        const routePathStore = this.props.routePathStore!;
        const routePath = routePathStore.routePath!;
        const isEditingDisabled = routePathStore.isEditingDisabled;

        const currentDate = toMidnightDate(new Date());
        const isRoutePathDeletable = routePath.startDate.getTime() >= currentDate.getTime();
        return (
            <SaveButton
                className={
                    (s.removeButton, !isRoutePathDeletable ? s.disabledHoverButton : undefined)
                }
                disabled={isEditingDisabled}
                savePreventedNotification={''}
                type='deleteButton'
                onClick={isRoutePathDeletable ? this.removeRoutePath : () => void 0}
                isWide={false}
                hasPadding={false}
                title={
                    !isRoutePathDeletable
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
