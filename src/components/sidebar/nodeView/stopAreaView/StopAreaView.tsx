import classnames from 'classnames';
import { reaction, IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { match } from 'react-router';
import { IDropdownItem } from '~/components/controls/Dropdown';
import SavePrompt, { ISaveModel } from '~/components/overlays/SavePrompt';
import ViewFormBase from '~/components/shared/inheritedComponents/ViewFormBase';
import Loader from '~/components/shared/loader/Loader';
import ButtonType from '~/enums/buttonType';
import TransitType from '~/enums/transitType';
import StopAreaFactory from '~/factories/stopAreaFactory';
import { IStopArea } from '~/models';
import stopAreaValidationModel from '~/models/validationModels/stopAreaValidationModel';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import StopAreaService, { ITerminalAreaItem } from '~/services/stopAreaService';
import { AlertStore } from '~/stores/alertStore';
import { CodeListStore } from '~/stores/codeListStore';
import { ConfirmStore } from '~/stores/confirmStore';
import { ErrorStore } from '~/stores/errorStore';
import { NodeStore } from '~/stores/nodeStore';
import { StopAreaStore } from '~/stores/stopAreaStore';
import { Button, Dropdown, TransitToggleButtonBar } from '../../../controls';
import InputContainer from '../../../controls/InputContainer';
import TextContainer from '../../../controls/TextContainer';
import SidebarHeader from '../../SidebarHeader';
import StopTable from './StopTable';
import * as s from './stopAreaView.scss';

interface IStopAreaViewProps {
    isNewStopArea: boolean;
    match?: match<any>;
    stopAreaStore?: StopAreaStore;
    nodeStore?: NodeStore;
    codeListStore?: CodeListStore;
    errorStore?: ErrorStore;
    alertStore?: AlertStore;
    confirmStore?: ConfirmStore;
}

interface IStopAreaViewState {
    isLoading: boolean;
    invalidPropertiesMap: object;
    terminalAreas: IDropdownItem[];
}

@inject('stopAreaStore', 'nodeStore', 'errorStore', 'alertStore', 'codeListStore', 'confirmStore')
@observer
class StopAreaView extends ViewFormBase<IStopAreaViewProps, IStopAreaViewState> {
    private isEditingDisabledListener: IReactionDisposer;
    private stopAreaPropertyListeners: IReactionDisposer[];
    private mounted: boolean;
    private listenersSet: boolean;

    constructor(props: IStopAreaViewProps) {
        super(props);
        this.state = {
            isLoading: false,
            invalidPropertiesMap: {},
            terminalAreas: []
        };
        this.stopAreaPropertyListeners = [];
        this.mounted = false;
        this.listenersSet = false;
    }

    async componentDidMount() {
        this.mounted = true;
        if (this.props.isNewStopArea) {
            await this.initNewStopArea();
        } else {
            await this.initExistingStopArea();
        }

        if (this.props.stopAreaStore!.stopArea) {
            this.validateStopArea();
        }
        this.props.stopAreaStore!.setIsEditingDisabled(!this.props.isNewStopArea);
        this.isEditingDisabledListener = reaction(
            () => this.props.stopAreaStore!.isEditingDisabled,
            this.onChangeIsEditingDisabled
        );
        const terminalAreas: ITerminalAreaItem[] = await StopAreaService.fetchAllTerminalAreas();

        if (this.mounted) {
            this.setState({
                terminalAreas: this.createTerminalAreaDropdownItems(terminalAreas)
            });
        }
        this.listenersSet = true;
    }

    componentDidUpdate(prevProps: IStopAreaViewProps) {
        const params = this.props.match!.params.id;
        if (prevProps.match!.params.id !== params) {
            if (this.props.isNewStopArea) {
                this.initNewStopArea();
            } else {
                this.initExistingStopArea();
            }
        }
    }

    componentWillUnmount() {
        this.mounted = false;
        this.props.stopAreaStore!.clear();
        // TODO: move property validation into store so that these listeners wouldn't be needed at the component
        if (this.listenersSet) {
            this.isEditingDisabledListener();
            this.removeNodePropertyListeners();
        }
    }

    private initExistingStopArea = async () => {
        this.setState({ isLoading: true });

        const stopAreaId = this.props.match!.params.id;
        try {
            if (stopAreaId) {
                const stopArea = await StopAreaService.fetchStopArea(stopAreaId);
                this.props.stopAreaStore!.init({
                    stopArea,
                    isNewStopArea: false
                });

                this.validateStopArea();
                this.createStopAreaPropertyListeners();
            }
        } catch (e) {
            this.props.errorStore!.addError(
                `Haku löytää pysäkkialue, jolla on pysalueid ${stopAreaId}, ei onnistunut.`,
                e
            );
        }
        this.setState({ isLoading: false });
    };

    private initNewStopArea = async () => {
        this.setState({ isLoading: true });

        const stopArea = StopAreaFactory.createNewStopArea();
        this.props.stopAreaStore!.init({
            stopArea,
            isNewStopArea: true
        });

        this.validateStopArea();
        this.createStopAreaPropertyListeners();

        this.setState({ isLoading: false });
    };

    private createStopAreaPropertyListeners = () => {
        const stopArea: IStopArea = this.props.stopAreaStore!.stopArea;
        if (!stopArea) return;

        for (const property in stopArea) {
            const listener = this.createStopAreaPropertyListener(property);
            this.stopAreaPropertyListeners.push(listener);
        }
    };

    private createStopAreaPropertyListener = (property: string) => {
        return reaction(
            () =>
                this.props.stopAreaStore!.stopArea && this.props.stopAreaStore!.stopArea![property],
            this.validateStopAreaProperty(property)
        );
    };

    private removeNodePropertyListeners = () => {
        this.stopAreaPropertyListeners.forEach((listener: IReactionDisposer) => listener());
        this.stopAreaPropertyListeners = [];
    };

    private save = async () => {
        this.setState({ isLoading: true });
        try {
            if (this.props.isNewStopArea) {
                const stopAreaId = await StopAreaService.createStopArea(
                    this.props.stopAreaStore!.stopArea
                );
                const nodeQueryParam = navigator.getQueryParam(QueryParams.nodeId);
                const nodeId = nodeQueryParam ? nodeQueryParam[0] : undefined;
                const latLngQueryParam = navigator.getQueryParam(QueryParams.latLng);
                const latLng = latLngQueryParam ? latLngQueryParam[0] : undefined;
                if (latLng) {
                    const url = routeBuilder
                        .to(SubSites.newNode)
                        .clear()
                        .toTarget(':id', latLng)
                        .append(QueryParams.stopAreaId, stopAreaId)
                        .toLink();
                    navigator.goTo(url);
                } else {
                    const url = routeBuilder
                        .to(SubSites.node)
                        .toTarget(':id', nodeId)
                        .clear()
                        .append(QueryParams.stopAreaId, stopAreaId)
                        .toLink();
                    navigator.goTo(url);
                }
            } else {
                await StopAreaService.updateStopArea(this.props.stopAreaStore!.stopArea);
                this.props.stopAreaStore!.setOldStopArea(this.props.stopAreaStore!.stopArea);
            }
            await this.props.alertStore!.setFadeMessage('Tallennettu!');
        } catch (e) {
            this.props.errorStore!.addError(`Tallennus epäonnistui`, e);
        }
        if (this.props.isNewStopArea) return;

        this.props.stopAreaStore!.setIsEditingDisabled(true);
        this.setState({ isLoading: false });
    };

    private showSavePrompt = () => {
        const confirmStore = this.props.confirmStore;
        const currentStopArea = this.props.stopAreaStore!.stopArea;
        const oldRoute = this.props.stopAreaStore!.oldStopArea;
        const saveModel: ISaveModel = {
            newData: currentStopArea,
            oldData: oldRoute,
            model: 'stopArea'
        };
        confirmStore!.openConfirm({
            content: <SavePrompt saveModels={[saveModel]} />,
            onConfirm: () => {
                this.save();
            }
        });
    };

    private onChangeIsEditingDisabled = () => {
        if (!this.mounted) return;

        this.clearInvalidPropertiesMap();
        const stopAreaStore = this.props.stopAreaStore;
        if (stopAreaStore!.isEditingDisabled) {
            stopAreaStore!.resetChanges();
        } else {
            this.validateStopArea();
        }
    };

    private validateStopArea = () => {
        this.validateAllProperties(stopAreaValidationModel, this.props.stopAreaStore!.stopArea);
    };

    private validateStopAreaProperty = (property: string) => () => {
        if (!this.mounted) return;

        const stopArea = this.props.stopAreaStore!.stopArea;
        if (!stopArea) return;

        const value = stopArea[property];
        this.validateProperty(stopAreaValidationModel[property], property, value);
    };

    private createTerminalAreaDropdownItems = (
        terminalAreas: ITerminalAreaItem[]
    ): IDropdownItem[] => {
        return terminalAreas.map((terminalArea: ITerminalAreaItem) => {
            const item: IDropdownItem = {
                value: `${terminalArea.id}`,
                label: `${terminalArea.name}`
            };
            return item;
        });
    };

    private selectTransitType = (transitType: TransitType) => {
        this.props.stopAreaStore!.updateStopAreaProperty('transitType', transitType);
        this.validateProperty(stopAreaValidationModel['transitType'], 'transitType', transitType);
    };

    private onChangeStopAreaProperty = (property: keyof IStopArea) => (value: any) => {
        this.props.stopAreaStore!.updateStopAreaProperty(property, value);
    };

    render() {
        const stopArea = this.props.stopAreaStore!.stopArea;
        const invalidPropertiesMap = this.state.invalidPropertiesMap;
        if (this.state.isLoading) {
            return (
                <div className={classnames(s.stopAreaView, s.loaderContainer)}>
                    <Loader />
                </div>
            );
        }
        if (!stopArea) return null;

        const isEditingDisabled = this.props.stopAreaStore!.isEditingDisabled;
        const transitType = this.props.stopAreaStore!.stopArea.transitType;

        const isSaveButtonDisabled =
            !transitType ||
            isEditingDisabled ||
            !this.props.stopAreaStore!.isDirty ||
            !this.isFormValid();
        const selectedTransitTypes = stopArea!.transitType ? [stopArea!.transitType!] : [];

        let transitTypeError;
        if (!transitType) {
            transitTypeError = 'Verkon tyyppi täytyy valita.';
        }
        return (
            <div className={s.stopAreaView}>
                <div className={s.content}>
                    <SidebarHeader
                        isEditButtonVisible={!this.props.isNewStopArea}
                        isEditing={!isEditingDisabled}
                        shouldShowClosePromptMessage={this.props.stopAreaStore!.isDirty!}
                        onEditButtonClick={this.props.stopAreaStore!.toggleIsEditingDisabled}
                    >
                        {this.props.isNewStopArea ? 'Luo uusi pysäkkialue' : 'Pysäkkialue'}
                    </SidebarHeader>
                    <div className={s.form}>
                        <div className={s.formSection}>
                            <div className={s.flexRow}>
                                <div className={s.formItem}>
                                    <div className={s.inputLabel}>VERKKO</div>
                                    <TransitToggleButtonBar
                                        selectedTransitTypes={selectedTransitTypes}
                                        toggleSelectedTransitType={this.selectTransitType}
                                        disabled={isEditingDisabled}
                                        errorMessage={transitTypeError}
                                    />
                                </div>
                            </div>
                            <div className={s.flexRow}>
                                <InputContainer
                                    label='NIMI'
                                    disabled={isEditingDisabled}
                                    value={stopArea.nameFi}
                                    validationResult={invalidPropertiesMap['nameFi']}
                                    onChange={this.onChangeStopAreaProperty('nameFi')}
                                />
                                <InputContainer
                                    label='NIMI RUOTSIKSI'
                                    disabled={isEditingDisabled}
                                    value={stopArea.nameSw}
                                    validationResult={invalidPropertiesMap['nameSw']}
                                    onChange={this.onChangeStopAreaProperty('nameSw')}
                                />
                            </div>

                            <div className={s.flexRow}>
                                <Dropdown
                                    onChange={this.onChangeStopAreaProperty('stopAreaGroupId')}
                                    validationResult={invalidPropertiesMap['stopAreaGroupId']}
                                    disabled={isEditingDisabled || !this.props.isNewStopArea}
                                    items={this.props.codeListStore!.getDropdownItemList(
                                        'Pysäkkialueid'
                                    )}
                                    selected={stopArea.stopAreaGroupId}
                                    label='PYSÄKKIALUE RYHMÄ'
                                />
                                <Dropdown
                                    onChange={this.onChangeStopAreaProperty('terminalAreaId')}
                                    items={this.state.terminalAreas}
                                    selected={stopArea.terminalAreaId}
                                    emptyItem={{
                                        value: undefined,
                                        label: ''
                                    }}
                                    disabled={isEditingDisabled}
                                    label='TERMINAALIALUE'
                                    validationResult={invalidPropertiesMap['terminalAreaId']}
                                />
                            </div>
                            {!this.props.isNewStopArea && (
                                <div className={s.flexRow}>
                                    <TextContainer label='MUOKANNUT' value={stopArea.modifiedBy} />
                                    <TextContainer
                                        label='MUOKATTU PVM'
                                        isTimeIncluded={true}
                                        value={stopArea.modifiedOn}
                                    />
                                </div>
                            )}
                        </div>
                        {!this.props.isNewStopArea && (
                            <div className={s.formSection}>
                                <StopTable stopArea={stopArea} />
                            </div>
                        )}
                    </div>
                </div>
                <Button
                    type={ButtonType.SAVE}
                    disabled={isSaveButtonDisabled}
                    onClick={() => (this.props.isNewStopArea ? this.save() : this.showSavePrompt())}
                >
                    {this.props.isNewStopArea ? 'Luo uusi pysäkkialue' : 'Tallenna muutokset'}
                </Button>
            </div>
        );
    }
}
export default StopAreaView;
