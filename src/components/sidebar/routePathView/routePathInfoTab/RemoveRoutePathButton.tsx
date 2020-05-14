import { inject, observer } from 'mobx-react';
import React from 'react';
import { Button } from '~/components/controls';
import RoutePathService from '~/services/routePathService';
import { AlertStore } from '~/stores/alertStore';
import { ConfirmStore } from '~/stores/confirmStore';
import { RoutePathStore } from '~/stores/routePathStore';
import NavigationUtils from '~/utils/NavigationUtils';
import { toDateString, toMidnightDate } from '~/utils/dateUtils';
import * as s from './removeRoutePathButton.scss';

interface IRemoveRoutePathButtonProps {
    routePathStore?: RoutePathStore;
    alertStore?: AlertStore;
    confirmStore?: ConfirmStore;
}

@inject('routePathStore', 'alertStore', 'confirmStore')
@observer
class RemoveRoutePathButton extends React.Component<IRemoveRoutePathButtonProps> {
    private removeRoutePath = () => {
        const routePath = this.props.routePathStore!.routePath!;
        this.props.confirmStore!.openConfirm({
            content: `Haluatko varmasti poistaa reitinsuunnan ${routePath.originFi} - ${
                routePath.destinationFi
            } (${routePath.direction}, ${toDateString(routePath.startDate)} - ${toDateString(
                routePath.endDate
            )})?`,
            onConfirm: async () => {
                // TODO: use <SaveButton /> to get saveLock logic
                // TODO: show saved notification
                await RoutePathService.removeRoutePath({
                    routeId: routePath.routeId,
                    direction: routePath.direction,
                    startDate: routePath.startDate,
                });
                // TODO: if status OK, only then show alert:
                this.props.alertStore!.setFadeMessage({ message: 'Reitinsuunta poistettu!' });
                NavigationUtils.openRouteView({
                    routeId: routePath.routeId,
                });
            },
        });
    };
    render() {
        const routePathStore = this.props.routePathStore!;
        const routePath = routePathStore.routePath!;
        const isEditingDisabled = routePathStore.isEditingDisabled;

        const currentDatePlusOne = toMidnightDate(new Date());
        currentDatePlusOne.setDate(currentDatePlusOne.getDate() + 1);
        const isRoutePathInFuture = routePath.startDate.getTime() >= currentDatePlusOne.getTime();
        return (
            <Button
                className={
                    (s.removeButton, !isRoutePathInFuture ? s.disabledHoverButton : undefined)
                }
                disabled={isEditingDisabled}
                onClick={isRoutePathInFuture ? this.removeRoutePath : () => void 0}
                isWide={false}
                title={
                    !isRoutePathInFuture
                        ? 'Vain tulevaisuudessa olevia reitinsuuntia voi poistaa.'
                        : ''
                }
            >
                Poista reitinsuunta
            </Button>
        );
    }
}

export default RemoveRoutePathButton;
