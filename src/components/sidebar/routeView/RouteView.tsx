import React from 'react';
import classnames from 'classnames';
import { observer, inject } from 'mobx-react';
import { match } from 'react-router';
import ButtonType from '~/enums/buttonType';
import Button from '~/components/controls/Button';
import Loader, { LoaderSize } from '~/components/shared/loader/Loader';
import ViewFormBase from '~/components/shared/inheritedComponents/ViewFormBase';
import routeValidationModel from '~/models/validationModels/routeValidationModel';
import { ErrorStore } from '~/stores/errorStore';
import { RouteStore } from '~/stores/routeStore';
import { DialogStore } from '~/stores/dialogStore';
import { Tabs, TabList, Tab, ContentList, ContentItem } from '~/components/shared/Tabs';
import RouteService from '~/services/routeService';
import RouteFactory from '~/factories/routeFactory';
import routeBuilder from '~/routing/routeBuilder';
import navigator from '~/routing/navigator';
import SubSites from '~/routing/subSites';
import QueryParams from '~/routing/queryParams';
import RoutePathTab from './RoutePathTab';
import RouteInfoTab from './RouteInfoTab';
import SidebarHeader from '../SidebarHeader';
import * as s from './routeView.scss';

interface IRouteViewProps {
    dialogStore?: DialogStore;
    errorStore?: ErrorStore;
    routeStore?: RouteStore;
    match?: match<any>;
    isNewRoute: boolean;
}

interface IRouteViewState {
    isLoading: boolean;
    invalidPropertiesMap: object;
    isEditingDisabled: boolean;
    selectedTabIndex: number;
}

@inject('routeStore', 'errorStore', 'dialogStore')
@observer
class RouteView extends ViewFormBase<IRouteViewProps, IRouteViewState>{
    constructor(props: IRouteViewProps) {
        super(props);
        this.state = {
            isLoading: true,
            invalidPropertiesMap: {},
            isEditingDisabled: !props.isNewRoute,
            selectedTabIndex: 0,
        };
    }

    componentDidMount() {
        super.componentDidMount();
        this.initialize();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.props.routeStore!.clear();
    }

    private setSelectedTabIndex = (index: number) => {
        this.setState({
            selectedTabIndex: index,
        });
    }

    private initialize = async () => {
        if (this.props.isNewRoute) {
            await this.createNewRoute();
        } else {
            await this.initExistingRoute();
        }
        if (this.props.routeStore!.route) {
            this.validateRoute();
            this.setState({
                isLoading: false,
            });
        }
    }

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
    }

    private initExistingRoute = async () => {
        await this.fetchRoute();
    }

    private fetchRoute = async () => {
        const routeId = this.props.match!.params.id;
        try {
            const route = await RouteService.fetchRoute(routeId);
            this.props.routeStore!.setRoute(route);
        } catch (e) {
            this.props.errorStore!.addError('Reitin haku epäonnistui.', e);
        }
    }

    private onChangeRouteProperty = (property: string) => (value: any) => {
        this.props.routeStore!.updateRouteProperty(property, value);
        this.validateProperty(routeValidationModel[property], property, value);
    }

    private save = async () => {
        this.setState({ isLoading: true });

        const route = this.props.routeStore!.route;
        try {
            if (this.props.isNewRoute) {
                await RouteService.createRoute(route!);
            } else {
                await RouteService.updateRoute(route!);
            }

            this.props.dialogStore!.setFadeMessage('Tallennettu!');
        } catch (e) {
            this.props.errorStore!.addError(`Tallennus epäonnistui`, e);
            return;
        }
        if (this.props.isNewRoute) {
            this.navigateToNewRoute();
            return;
        }
        this.setState({
            isEditingDisabled: true,
            invalidPropertiesMap: {},
            isLoading: false,
        });
    }

    private navigateToNewRoute = () => {
        const route = this.props.routeStore!.route;
        const routeViewLink = routeBuilder
            .to(SubSites.route)
            .toTarget(route!.id)
            .toLink();
        navigator.goTo(routeViewLink);
    }

    private toggleIsEditing = () => {
        const isEditingDisabled = this.state.isEditingDisabled;
        if (!isEditingDisabled) {
            this.props.routeStore!.resetChanges();
        }
        this.toggleIsEditingDisabled();
        if (!isEditingDisabled) this.validateRoute();
    }

    private validateRoute = () => {
        this.validateAllProperties(routeValidationModel, this.props.routeStore!.route);
    }

    private renderRouteViewHeader = () => {
        const lineId = navigator.getQueryParam(QueryParams.lineId);
        return (
            <div className={s.sidebarHeaderSection}>
                <SidebarHeader
                    isEditButtonVisible={!this.props.isNewRoute}
                    onEditButtonClick={this.toggleIsEditing}
                    isEditing={!this.state.isEditingDisabled}
                    shouldShowClosePromptMessage={this.props.routeStore!.isDirty}
                >
                    {
                        this.props.isNewRoute ?
                        `Luo uusi reitti linjalle ${lineId}` :
                        `Reitti ${this.props.routeStore!.route!.id}`
                    }
                </SidebarHeader>
            </div>
        );
    }

    render() {
        if (this.state.isLoading) {
            return (
                <div className={classnames(s.routeView, s.loaderContainer)}>
                    <Loader size={LoaderSize.MEDIUM}/>
                </div>
            );
        }
        if (!this.props.routeStore!.route) return null;

        const isSaveButtonDisabled = this.state.isEditingDisabled
            || !this.props.routeStore!.isDirty
            || !this.isFormValid();

        return (
            <div className={s.routeView}>
                <div className={s.content}>
                    {this.renderRouteViewHeader()}
                    <Tabs>
                        <TabList
                            selectedTabIndex={this.state.selectedTabIndex}
                            setSelectedTabIndex={this.setSelectedTabIndex}
                        >
                            <Tab><div>Reitin tiedot</div></Tab>
                            <Tab><div>Reitinsuunnat</div></Tab>
                        </TabList>
                        <ContentList selectedTabIndex={this.state.selectedTabIndex}>
                            <ContentItem>
                                <RouteInfoTab
                                    isEditingDisabled={this.state.isEditingDisabled}
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
                    onClick={this.save}
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
