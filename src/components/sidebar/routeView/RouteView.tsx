import classnames from 'classnames';
import { reaction, IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { match } from 'react-router';
import Button from '~/components/controls/Button';
import SavePrompt from '~/components/overlays/SavePrompt';
import { ContentItem, ContentList, Tab, Tabs, TabList } from '~/components/shared/Tabs';
import ViewFormBase from '~/components/shared/inheritedComponents/ViewFormBase';
import Loader, { LoaderSize } from '~/components/shared/loader/Loader';
import ButtonType from '~/enums/buttonType';
import RouteFactory from '~/factories/routeFactory';
import { IRoute } from '~/models';
import routeValidationModel from '~/models/validationModels/routeValidationModel';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import RouteService from '~/services/routeService';
import { AlertStore } from '~/stores/alertStore';
import { ConfirmStore } from '~/stores/confirmStore';
import { ErrorStore } from '~/stores/errorStore';
import { RouteStore } from '~/stores/routeStore';
import SidebarHeader from '../SidebarHeader';
import RouteInfoTab from './RouteInfoTab';
import RoutePathTab from './RoutePathTab';
import * as s from './routeView.scss';

interface IRouteViewProps {
    alertStore?: AlertStore;
    errorStore?: ErrorStore;
    routeStore?: RouteStore;
    confirmStore?: ConfirmStore;
    match?: match<any>;
    isNewRoute: boolean;
}

interface IRouteViewState {
    isLoading: boolean;
    invalidPropertiesMap: object;
    selectedTabIndex: number;
}

@inject('routeStore', 'errorStore', 'alertStore', 'confirmStore')
@observer
class RouteView extends ViewFormBase<IRouteViewProps, IRouteViewState> {
    private isEditingDisabledListener: IReactionDisposer;

    constructor(props: IRouteViewProps) {
        super(props);
        this.state = {
            isLoading: true,
            invalidPropertiesMap: {},
            selectedTabIndex: 0
        };
    }

    componentDidMount() {
        this.initialize();
        this.isEditingDisabledListener = reaction(
            () => this.props.routeStore!.isEditingDisabled,
            this.onChangeIsEditingDisabled
        );
        this.props.routeStore!.setIsEditingDisabled(!this.props.isNewRoute);
    }

    componentWillUnmount() {
        this.props.routeStore!.clear();
        this.isEditingDisabledListener();
    }

    private setSelectedTabIndex = (index: number) => {
        this.setState({
            selectedTabIndex: index
        });
    };

    private initialize = async () => {
        if (this.props.isNewRoute) {
            await this.createNewRoute();
        } else {
            await this.initExistingRoute();
        }
        if (this.props.routeStore!.route) {
            this.setState({
                isLoading: false
            });
        }
    };

    private createNewRoute = async () => {
        try {
            if (!this.props.routeStore!.route) {
                const lineId = navigator.getQueryParam(QueryParams.lineId);
                const newRoute = RouteFactory.createNewRoute(lineId);
                this.props.routeStore!.setRoute(newRoute);
            }
        } catch (e) {
            this.props.errorStore!.addError('Uuden reitin luonti epäonnistui', e);
        }
    };

    private initExistingRoute = async () => {
        await this.fetchRoute();
    };

    private fetchRoute = async () => {
        const routeId = this.props.match!.params.id;
        try {
            const route = await RouteService.fetchRoute(routeId);
            this.props.routeStore!.setRoute(route);
        } catch (e) {
            this.props.errorStore!.addError('Reitin haku epäonnistui.', e);
        }
    };

    private onChangeRouteProperty = (property: keyof IRoute) => (value: any) => {
        this.props.routeStore!.updateRouteProperty(property, value);
        this.validateProperty(routeValidationModel[property], property, value);
    };

    private save = async () => {
        this.setState({ isLoading: true });

        const route = this.props.routeStore!.route;
        try {
            if (this.props.isNewRoute) {
                await RouteService.createRoute(route!);
            } else {
                await RouteService.updateRoute(route!);
            }

            this.props.alertStore!.setFadeMessage('Tallennettu!');
        } catch (e) {
            this.props.errorStore!.addError(`Tallennus epäonnistui`, e);
            return;
        }
        if (this.props.isNewRoute) {
            this.navigateToNewRoute();
            return;
        }
        this.props.routeStore!.setOldRoute(route!);
        this.setState({
            invalidPropertiesMap: {},
            isLoading: false
        });
        this.props.routeStore!.setIsEditingDisabled(true);
    };

    private showSavePrompt = () => {
        const confirmStore = this.props.confirmStore;
        const currentRoute = this.props.routeStore!.route;
        const oldRoute = this.props.routeStore!.oldRoute;
        confirmStore!.openConfirm(
            <SavePrompt newData={currentRoute} oldData={oldRoute} model={'route'} />,
            () => {
                this.save();
            }
        );
    };

    private onChangeIsEditingDisabled = () => {
        this.clearInvalidPropertiesMap();
        if (this.props.routeStore!.isEditingDisabled) {
            this.props.routeStore!.resetChanges();
        } else {
            this.validateRoute();
        }
    };

    private navigateToNewRoute = () => {
        const route = this.props.routeStore!.route;
        const routeViewLink = routeBuilder
            .to(SubSites.route)
            .toTarget(':id', route!.id)
            .toLink();
        navigator.goTo(routeViewLink);
    };

    private validateRoute = () => {
        this.validateAllProperties(routeValidationModel, this.props.routeStore!.route);
    };

    private renderRouteViewHeader = () => {
        const lineId = navigator.getQueryParam(QueryParams.lineId);
        return (
            <div className={s.sidebarHeaderSection}>
                <SidebarHeader
                    isEditButtonVisible={!this.props.isNewRoute}
                    onEditButtonClick={this.props.routeStore!.toggleIsEditingDisabled}
                    isEditing={!this.props.routeStore!.isEditingDisabled}
                    shouldShowClosePromptMessage={this.props.routeStore!.isDirty}
                >
                    {this.props.isNewRoute
                        ? `Luo uusi reitti linjalle ${lineId}`
                        : `Reitti ${this.props.routeStore!.route!.id}`}
                </SidebarHeader>
            </div>
        );
    };

    render() {
        const routeStore = this.props.routeStore;
        if (this.state.isLoading) {
            return (
                <div className={classnames(s.routeView, s.loaderContainer)}>
                    <Loader size={LoaderSize.MEDIUM} />
                </div>
            );
        }
        if (!this.props.routeStore!.route) return null;

        const isEditingDisabled = routeStore!.isEditingDisabled;
        const isSaveButtonDisabled =
            isEditingDisabled || !this.props.routeStore!.isDirty || !this.isFormValid();

        return (
            <div className={s.routeView}>
                <div className={s.content}>
                    {this.renderRouteViewHeader()}
                    <Tabs>
                        <TabList
                            selectedTabIndex={this.state.selectedTabIndex}
                            setSelectedTabIndex={this.setSelectedTabIndex}
                        >
                            <Tab>
                                <div>Reitin tiedot</div>
                            </Tab>
                            <Tab isDisabled={this.props.isNewRoute}>
                                <div>Reitinsuunnat</div>
                            </Tab>
                        </TabList>
                        <ContentList selectedTabIndex={this.state.selectedTabIndex}>
                            <ContentItem>
                                <RouteInfoTab
                                    isEditingDisabled={isEditingDisabled}
                                    isNewRoute={this.props.isNewRoute}
                                    onChangeRouteProperty={this.onChangeRouteProperty}
                                    invalidPropertiesMap={this.state.invalidPropertiesMap}
                                    setValidatorResult={this.setValidatorResult}
                                />
                            </ContentItem>
                            <ContentItem>
                                <RoutePathTab />
                            </ContentItem>
                        </ContentList>
                    </Tabs>
                </div>
                <Button
                    onClick={() => (this.props.isNewRoute ? this.save() : this.showSavePrompt())}
                    type={ButtonType.SAVE}
                    disabled={isSaveButtonDisabled}
                >
                    {this.props.isNewRoute ? 'Luo uusi reitti' : 'Tallenna muutokset'}
                </Button>
            </div>
        );
    }
}

export default RouteView;
