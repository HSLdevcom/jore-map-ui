import React from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import { FiEdit, FiCopy } from 'react-icons/fi';
import ButtonType from '~/enums/buttonType';
import Button from '~/components/controls/Button';
import { IRoutePath } from '~/models';
import { RoutePathStore } from '~/stores/routePathStore';
import { IValidationResult } from '~/validation/FormValidator';
import { ErrorStore } from '~/stores/errorStore';
import navigator from '~/routing/navigator';
import routeBuilder from '~/routing/routeBuilder';
import subSites from '~/routing/subSites';
import RoutePathViewForm from './RoutePathViewForm';
import * as s from './routePathInfoTab.scss';

interface IRoutePathInfoTabState {
    isLoading: boolean;
}

interface IRoutePathInfoTabProps {
    isEditingDisabled: boolean;
    routePathStore?: RoutePathStore;
    errorStore?: ErrorStore;
    routePath: IRoutePath;
    markInvalidFields: Function;
    toggleIsEditingDisabled: Function;
}

@inject('routePathStore', 'errorStore')
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

    private redirectToNewRoutePathView = () => {
        const routePath = this.props.routePathStore!.routePath;
        if (!routePath) return;

        const newRoutePathLink = routeBuilder
        .to(subSites.newRoutePath, { routeId: routePath.routeId, lineId: routePath.lineId })
        .toLink();

        navigator.goTo(newRoutePathLink);
    }

    private toggleIsEditingDisabled = () => {
        this.props.toggleIsEditingDisabled();
    }

    render() {
        // tslint:disable-next-line:max-line-length
        const routePath = this.props.routePathStore!.routePath;

        if (!routePath) return 'Error';
        return (
        <div className={classnames(s.routePathInfoTabView, s.form)}>
            <div className={s.content}>
                <div className={s.routePathTabActions}>
                    <Button
                        type={ButtonType.ROUND}
                        onClick={this.toggleIsEditingDisabled}
                    >
                        <FiEdit/>
                        {
                            this.props.isEditingDisabled ? 'Muokkaa' : 'Peruuta'
                        }
                    </Button>
                    <Button
                        type={ButtonType.ROUND}
                        onClick={this.redirectToNewRoutePathView!}
                    >
                        <FiCopy />
                        Kopioi
                    </Button>
                </div>
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
