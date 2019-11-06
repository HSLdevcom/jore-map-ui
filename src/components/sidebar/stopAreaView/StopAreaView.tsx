import classnames from 'classnames';
import { reaction, IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { match } from 'react-router';
import { IDropdownItem } from '~/components/controls/Dropdown';
import ViewFormBase from '~/components/shared/inheritedComponents/ViewFormBase';
import Loader from '~/components/shared/loader/Loader';
import ButtonType from '~/enums/buttonType';
import TransitType from '~/enums/transitType';
import StopAreaFactory from '~/factories/stopAreaFactory';
import { IStopArea } from '~/models';
import stopAreaValidationModel from '~/models/validationModels/stopAreaValidationModel';
import StopAreaService, { ITerminalAreaItem } from '~/services/stopAreaService';
import StopService, { IStopItem } from '~/services/stopService';
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
    terminalAreas: IDropdownItem[];
    stops: IStopItem[];
}

@inject('stopAreaStore', 'errorStore', 'alertStore', 'codeListStore')
@observer
class StopAreaView extends ViewFormBase<IStopAreaViewProps, IStopAreaViewState> {
    private isEditingDisabledListener: IReactionDisposer;
    private stopAreaPropertyListeners: IReactionDisposer[];
    private mounted: boolean;

    constructor(props: IStopAreaViewProps) {
        super(props);
        this.state = {
            isLoading: false,
            invalidPropertiesMap: {},
            terminalAreas: [],
            stops: []
        };
        this.stopAreaPropertyListeners = [];
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
        const stops: IStopItem[] = await StopService.fetchAllStops();

        if (this.mounted) {
            this.setState({
                stops,
                terminalAreas: this.createTerminalAreaDropdownItems(terminalAreas)
            });
        }
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
        this.isEditingDisabledListener();
        this.removeNodePropertyListeners();
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
                await StopAreaService.createStopArea(this.props.stopAreaStore!.stopArea);
                // TODO: createStopArea returns id which should be given to stopForm for selecting the newly created stopArea
                // const stopAreaId = await StopAreaService.createStopArea(this.props.stopAreaStore!.stopArea);
            } else {
                await StopAreaService.updateStopArea(this.props.stopAreaStore!.stopArea);
                this.props.stopAreaStore!.setOldStopArea(this.props.stopAreaStore!.stopArea);
            }
            await this.props.alertStore!.setFadeMessage('Tallennettu!');
        } catch (e) {
            this.props.errorStore!.addError(`Tallennus epäonnistui`, e);
        }
        this.props.stopAreaStore!.setIsEditingDisabled(true);
        this.setState({ isLoading: false });
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

    private validateStopArea = () => {
        this.validateAllProperties(stopAreaValidationModel, this.props.stopAreaStore!.stopArea);
    };

    private validateStopAreaProperty = (property: string) => () => {
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

    private renderStopsByStopArea = (stops: IStopItem[]) => {
        return stops.map((stop: IStopItem, index: number) => {
            return (
                <tr key={index} className={s.stopTableRow}>
                    <td>{stop.soltunnus}</td>
                    <td>{stop.pysnimi}</td>
                    <td>{stop.pysnimir}</td>
                </tr>
            );
        });
    };

    private getStopsByStopAreaId = (stopAreaId: string | undefined) => {
        if (!stopAreaId) return [];
        const stopsByStopAreaId = this.state.stops.filter(iterable => {
            return iterable.pysalueid === stopAreaId;
        });
        return stopsByStopAreaId;
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
        const stopsByStopArea = this.getStopsByStopAreaId(stopArea.id);

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
                        Pysäkkialue
                    </SidebarHeader>
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
                                    value: '',
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
                    <div className={s.flexRow}>
                        <div className={s.stopTableView}>
                            <div className={s.sectionHeader}>Pysäkkialueen pysäkit</div>
                            {stopsByStopArea.length > 0 ? (
                                <table className={s.stopHeaderTable}>
                                    <tbody>
                                        <tr>
                                            <th
                                                className={classnames(s.inputLabel, s.columnHeader)}
                                            >
                                                SOLMUN TUNNUS
                                            </th>
                                            <th
                                                className={classnames(s.inputLabel, s.columnHeader)}
                                            >
                                                NIMI SUOMEKSI
                                            </th>
                                            <th
                                                className={classnames(s.inputLabel, s.columnHeader)}
                                            >
                                                NIMI RUOTSIKSI
                                            </th>
                                            <th className={s.columnHeader} />
                                        </tr>
                                        {this.renderStopsByStopArea(stopsByStopArea)}
                                    </tbody>
                                </table>
                            ) : (
                                <div>
                                    {this.props.isNewStopArea
                                        ? ''
                                        : 'Pysäkkialueella ei pysäkkejä.'}
                                </div>
                            )}
                        </div>
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
