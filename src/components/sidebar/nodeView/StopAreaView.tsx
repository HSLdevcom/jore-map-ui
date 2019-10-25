import classnames from 'classnames';
import { reaction, IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { match } from 'react-router';
import ViewFormBase from '~/components/shared/inheritedComponents/ViewFormBase';
import Loader from '~/components/shared/loader/Loader';
import ButtonType from '~/enums/buttonType';
import TransitType from '~/enums/transitType';
import StopAreaFactory from '~/factories/stopAreaFactory';
import { IStopArea } from '~/models';
import stopAreaValidationModel from '~/models/validationModels/stopAreaValidationModel';
import navigator from '~/routing/navigator';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import StopAreaService from '~/services/stopAreaService';
import { AlertStore } from '~/stores/alertStore';
import { CodeListStore } from '~/stores/codeListStore';
import { ErrorStore } from '~/stores/errorStore';
import { StopAreaStore } from '~/stores/stopAreaStore';
import { Button, Dropdown, TransitToggleButtonBar } from '../../controls';
import InputContainer from '../../controls/InputContainer';
import TextContainer from '../../controls/TextContainer';
import SidebarHeader from '../SidebarHeader';
import * as s from './stopAreaView.scss';

interface IStopAreaViewProps {
    isNewStopArea: boolean;
    match?: match<any>;
    codeListStore?: CodeListStore;
    errorStore?: ErrorStore;
    stopAreaStore?: StopAreaStore;
    alertStore?: AlertStore;
}

interface IStopAreaViewState {
    isLoading: boolean;
    invalidPropertiesMap: object;
}

@inject('stopAreaStore', 'errorStore', 'alertStore', 'codeListStore')
@observer
class StopAreaView extends ViewFormBase<IStopAreaViewProps, IStopAreaViewState> {
    private isEditingDisabledListener: IReactionDisposer;

    constructor(props: IStopAreaViewProps) {
        super(props);
        this.state = {
            isLoading: false,
            invalidPropertiesMap: {}
        };
    }

    async componentDidMount() {
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
        this.props.stopAreaStore!.clear();
        this.isEditingDisabledListener();
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
        this.props.stopAreaStore!.clear();

        const stopArea = StopAreaFactory.createNewStopArea();
        this.props.stopAreaStore!.init({
            stopArea,
            isNewStopArea: true
        });

        this.validateStopArea();

        this.setState({ isLoading: false });
    };

    private save = async () => {
        this.setState({ isLoading: true });
        try {
            if (this.props.isNewStopArea) {
                await StopAreaService.createStopArea(this.props.stopAreaStore!.stopArea);
            } else {
                await StopAreaService.updateStopArea(this.props.stopAreaStore!.stopArea);
                this.props.stopAreaStore!.setOldStopArea(this.props.stopAreaStore!.stopArea);
            }
            await this.props.alertStore!.setFadeMessage('Tallennettu!');
        } catch (e) {
            this.props.errorStore!.addError(`Tallennus epäonnistui`, e);
        }

        if (this.props.isNewStopArea) {
            this.navigateToNewStopArea();
            return;
        }
        this.setState({ isLoading: false });
        this.props.stopAreaStore!.setIsEditingDisabled(true);
    };

    private onChangeIsEditingDisabled = () => {
        this.clearInvalidPropertiesMap();
        const stopAreaStore = this.props.stopAreaStore;
        if (stopAreaStore!.isEditingDisabled) {
            stopAreaStore!.resetChanges();
        } else {
            this.validateStopArea();
        }
    };

    private navigateToNewStopArea = () => {
        const stopArea = this.props.stopAreaStore!.stopArea;
        const stopAreaViewStopArea = routeBuilder
            .to(SubSites.stopArea)
            .toTarget(':id', stopArea.id)
            .toLink();
        navigator.goTo(stopAreaViewStopArea);
    };

    private validateStopArea = () => {
        this.validateAllProperties(stopAreaValidationModel, this.props.stopAreaStore!.stopArea);
    };

    private selectTransitType = (transitType: TransitType) => {
        this.props.stopAreaStore!.updateStopAreaProperty('transitType', transitType);
        this.validateProperty(stopAreaValidationModel['transitType'], 'transitType', transitType);
    };

    // TODO: onChangeProperty listener with:
    // this.validateProperty(stopAreaValidationModel[property], property, value);

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

        return (
            <div className={s.stopAreaView}>
                <div className={s.content}>
                    <SidebarHeader
                        isEditButtonVisible={!this.props.isNewStopArea}
                        isEditing={!isEditingDisabled}
                        shouldShowClosePromptMessage={this.props.stopAreaStore!.isDirty!}
                        onEditButtonClick={this.props.stopAreaStore!.toggleIsEditingDisabled}
                    >
                        Pysäkkialue
                    </SidebarHeader>
                    <div className={s.formSection}>
                        <div className={s.flexRow}>
                            <div className={s.formItem}>
                                <div className={s.inputLabel}>VERKKO</div>
                                <TransitToggleButtonBar
                                    selectedTransitTypes={selectedTransitTypes}
                                    toggleSelectedTransitType={this.selectTransitType}
                                    disabled={!this.props.isNewStopArea}
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
                                disabled={isEditingDisabled}
                                items={this.props.codeListStore!.getDropdownItemList(
                                    'Pysäkkialueid'
                                )}
                                selected={stopArea.stopAreaGroupId}
                                label='PYSÄKKIALUE'
                            />
                            {/* TODO: */}
                            <div>TERMINAALI</div>
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
                </div>
                <Button
                    type={ButtonType.SAVE}
                    disabled={isSaveButtonDisabled}
                    onClick={() => this.save()}
                >
                    Tallenna muutokset
                </Button>
            </div>
        );
    }
}
export default StopAreaView;
