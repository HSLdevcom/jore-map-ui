import React from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import { IRoutePath } from '~/models';
import { RoutePathStore } from '~/stores/routePathStore';
import { IValidationResult } from '~/validation/FormValidator';
import RoutePathViewForm from './RoutePathViewForm';
import * as s from './routePathInfoTab.scss';

interface IRoutePathInfoTabState {
    isLoading: boolean;
}

interface IRoutePathInfoTabProps {
    isEditingDisabled: boolean;
    routePathStore?: RoutePathStore;
    routePath: IRoutePath;
    markInvalidFields: Function;
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

    private onChange = (property: string, value: any, validationResult?: IValidationResult) => {
        this.props.routePathStore!.updateRoutePathProperty(property, value);
        if (validationResult) {
            this.props.markInvalidFields(property, validationResult!.isValid);
        }
    }

    render() {
        const routePath = this.props.routePathStore!.routePath;

        if (!routePath) return 'Error';
        return (
        <div className={classnames(s.routePathInfoTabView, s.form)}>
            <div className={s.content}>
                <div className={s.formSection}>
                    <RoutePathViewForm
                        onChange={this.onChange}
                        isEditingDisabled={this.props.isEditingDisabled}
                        routePath={this.props.routePathStore!.routePath!}
                    />
                </div>
            </div>
        </div>
        );
    }
}
export default RoutePathInfoTab;
