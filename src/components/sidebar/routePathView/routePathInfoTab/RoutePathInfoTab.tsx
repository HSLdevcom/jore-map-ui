import React from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import { IRoutePath } from '~/models';
import { RoutePathStore } from '~/stores/routePathStore';
import RoutePathForm from './RoutePathForm';
import * as s from './routePathInfoTab.scss';

interface IRoutePathInfoTabState {
    isLoading: boolean;
}

interface IRoutePathInfoTabProps {
    isEditingDisabled: boolean;
    routePathStore?: RoutePathStore;
    routePath: IRoutePath;
    markInvalidProperties: (property: string, isValid: boolean) => void;
    isNewRoutePath: boolean;
}

@inject('routePathStore')
@observer
class RoutePathInfoTab extends React.Component<IRoutePathInfoTabProps, IRoutePathInfoTabState>{
    constructor(props: any) {
        super(props);
        this.state = {
            isLoading: true,
        };
    }

    render() {
        const routePath = this.props.routePathStore!.routePath;

        if (!routePath) return 'Error';
        return (
        <div className={classnames(s.routePathInfoTabView, s.form)}>
            <div className={s.content}>
                <div className={s.formSection}>
                    <RoutePathForm
                        markInvalidProperties={this.props.markInvalidProperties}
                        isEditingDisabled={this.props.isEditingDisabled}
                        routePath={this.props.routePathStore!.routePath!}
                        isNewRoutePath={this.props.isNewRoutePath}
                    />
                </div>
            </div>
        </div>
        );
    }
}
export default RoutePathInfoTab;
