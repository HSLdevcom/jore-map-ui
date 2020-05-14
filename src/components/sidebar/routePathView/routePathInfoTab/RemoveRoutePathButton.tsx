import { inject, observer } from 'mobx-react';
import React from 'react';
import { Button } from '~/components/controls';
import { ConfirmStore } from '~/stores/confirmStore';
import { RoutePathStore } from '~/stores/routePathStore';
import * as s from './removeRoutePathButton.scss';

interface IRemoveRoutePathButtonProps {
    routePathStore?: RoutePathStore;
    confirmStore?: ConfirmStore;
}

@inject('routePathStore', 'confirmStore')
@observer
class RemoveRoutePathButton extends React.Component<IRemoveRoutePathButtonProps> {
    private removeRoutePath = () => {
        this.props.confirmStore!.openConfirm({
            content: 'Haluatko varmasti poistaa reitinsuunnan?',
            onConfirm: () => {
                // TODO
                // console.log('after confirm');
            },
        });
        // TODO
        // console.log('at remove routePath');
    };
    render() {
        // const isEditingDisabled = this.props.routePathStore!.isEditingDisabled;
        // const isRemoveRoutePathButtonDisabled = isEditingDisabled ||
        return (
            <Button className={s.removeButton} onClick={this.removeRoutePath} isWide={false}>
                Poista reitinsuunta
            </Button>
        );
    }
}

export default RemoveRoutePathButton;
