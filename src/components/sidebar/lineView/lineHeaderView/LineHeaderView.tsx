import React from 'react';
import classnames from 'classnames';
import Moment from 'moment';
import { observer, inject } from 'mobx-react';
import { match } from 'react-router';
import { ErrorStore } from '~/stores/errorStore';
import { AlertStore } from '~/stores/alertStore';
import InputContainer from '~/components/controls/InputContainer';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import { ILineHeader } from '~/models';
import lineHeaderValidationModel from '~/models/validationModels/lineHeaderValidationModel';
import { IValidationResult } from '~/validation/FormValidator';
import ButtonType from '~/enums/buttonType';
import { Button } from '~/components/controls';
import Loader, { LoaderSize } from '~/components/shared/loader/Loader';
import TextContainer from '~/components/controls/TextContainer';
import ViewFormBase from '~/components/shared/inheritedComponents/ViewFormBase';
import LineHeaderFactory from '~/factories/lineHeaderFactory';
import LineHeaderService from '~/services/lineHeaderService';
import { LineHeaderStore } from '~/stores/lineHeaderStore';
import SidebarHeader from '../../SidebarHeader';
import * as s from './lineHeaderView.scss';

interface ILineHeaderViewProps {
    alertStore?: AlertStore;
    errorStore?: ErrorStore;
    lineHeaderStore?: LineHeaderStore;
    match?: match<any>;
    isNewLineHeader: boolean;
}

interface ILineHeaderViewState {
    isLoading: boolean;
    invalidPropertiesMap: object;
    isEditingDisabled: boolean;
    reservedStartDates: string[];
}

@inject('lineHeaderStore', 'errorStore', 'alertStore')
@observer
class LineHeaderView extends ViewFormBase<
    ILineHeaderViewProps,
    ILineHeaderViewState
> {
    constructor(props: ILineHeaderViewProps) {
        super(props);
        this.state = {
            isLoading: true,
            invalidPropertiesMap: {},
            isEditingDisabled: !props.isNewLineHeader,
            reservedStartDates: []
        };
    }

    componentDidMount() {
        super.componentDidMount();
        this.initialize();
    }

    componentDidUpdate(prevProps: ILineHeaderViewProps) {
        if (
            this.props.match!.params.startDate !==
            prevProps.match!.params.startDate
        ) {
            this.initialize();
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.props.lineHeaderStore!.clear();
    }

    private initialize = async () => {
        if (this.props.isNewLineHeader) {
            await this.createNewLine();
        } else {
            await this.initExistingLine();
        }
        if (this.props.lineHeaderStore!.lineHeader) {
            await this.queryOtherLineHeaders();
            this.validateLineHeader();
            this.setState({
                isLoading: false
            });
        }
    };

    private queryOtherLineHeaders = async () => {
        const lineHeader = this.props.lineHeaderStore!.lineHeader;
        const allLineHeaders: ILineHeader[] = await LineHeaderService.fetchLineHeaders(
            lineHeader!.lineId
        );
        let reservedStartDates = allLineHeaders.map((lt: ILineHeader) =>
            Moment(lt.startDate).format()
        );

        // if is editing, filter the current lineHeader date out from reserved dates
        if (!this.props.isNewLineHeader) {
            reservedStartDates = reservedStartDates.filter(
                (startDate: string) =>
                    startDate !== Moment(lineHeader!.startDate).format()
            );
        }

        this.setState({
            reservedStartDates
        });
    };

    private createNewLine = async () => {
        const lineId = this.props.match!.params.id;
        const startDate = navigator.getQueryParamValues().startDate;

        if (startDate) {
            await this.fetchLine(lineId, Moment(startDate).format());
        } else {
            try {
                const newLineHeader = LineHeaderFactory.createNewLineHeader(
                    lineId
                );
                this.props.lineHeaderStore!.setLineHeader(newLineHeader);
            } catch (e) {
                this.props.errorStore!.addError(
                    'Uuden linjan nimen luonti epäonnistui',
                    e
                );
            }
        }
    };

    private initExistingLine = async () => {
        const lineId = this.props.match!.params.id;
        const startDate = this.props.match!.params.startDate;
        await this.fetchLine(lineId, startDate);
    };

    private fetchLine = async (lineId: string, startDate: string) => {
        try {
            const lineHeader = await LineHeaderService.fetchLineHeader(
                lineId,
                startDate
            );

            this.props.lineHeaderStore!.setLineHeader(lineHeader);
        } catch (e) {
            this.props.errorStore!.addError(
                'Linja otsikon haku epäonnistui.',
                e
            );
        }
    };

    private validateLineHeader = () => {
        this.validateAllProperties(
            lineHeaderValidationModel,
            this.props.lineHeaderStore!.lineHeader
        );
        this.validateDates();
    };

    private save = async () => {
        this.setState({ isLoading: true });

        const lineHeader = this.props.lineHeaderStore!.lineHeader;
        const isStartDateChanged =
            lineHeader!.startDate !== lineHeader!.originalStartDate;

        try {
            if (this.props.isNewLineHeader) {
                await LineHeaderService.createLineHeader(lineHeader!);
            } else {
                await LineHeaderService.updateLineHeader(lineHeader!);
            }

            this.props.alertStore!.setFadeMessage('Tallennettu!');
        } catch (e) {
            this.props.errorStore!.addError(`Tallennus epäonnistui`, e);
            return;
        }
        if (this.props.isNewLineHeader || isStartDateChanged) {
            this.navigateToNewLineHeader();
            return;
        }
        this.setState({
            isEditingDisabled: true,
            invalidPropertiesMap: {},
            isLoading: false
        });
    };

    private navigateToNewLineHeader = () => {
        const lineHeader = this.props.lineHeaderStore!.lineHeader;
        const lineHeaderViewLink = routeBuilder
            .to(SubSites.lineHeader)
            .toTarget(':id', lineHeader!.lineId)
            .toTarget(':startDate', Moment(lineHeader!.startDate).format())
            .toLink();
        navigator.goTo(lineHeaderViewLink);
    };

    private onChangeLineHeaderProperty = (property: keyof ILineHeader) => (
        value: any
    ) => {
        this.props.lineHeaderStore!.updateLineHeaderProperty(property, value);
        this.validateProperty(
            lineHeaderValidationModel[property],
            property,
            value
        );
    };

    private changeDates = (
        startDate: Date | undefined,
        endDate: Date | undefined
    ) => {
        this.onChangeLineHeaderProperty('startDate')(startDate);
        this.onChangeLineHeaderProperty('endDate')(endDate);
        this.validateDates();
    };

    // a custom date validator
    private validateDates = () => {
        const lineHeader = this.props.lineHeaderStore!.lineHeader;
        const startDate = lineHeader!.startDate;
        const endDate = lineHeader!.endDate;
        // is startDate (for current lineId) unique?
        if (
            startDate &&
            this.state.reservedStartDates.includes(Moment(startDate).format())
        ) {
            const validationResult: IValidationResult = {
                isValid: false,
                errorMessage: `Asetettu voimaanastumispäivä on jo käytössä toisella tälle linjalle kuuluvalla linjan otsikolla.`
            };
            this.setValidatorResult('startDate', validationResult);
        }
        // is end date before start date?
        else if (
            startDate &&
            endDate &&
            endDate.getTime() < startDate.getTime()
        ) {
            const validationResult: IValidationResult = {
                isValid: false,
                errorMessage: `Viimeinen voimassaolopäivä ei voi olla ennen voimaanastumispäivää.`
            };
            this.setValidatorResult('endDate', validationResult);
        }
    };

    private onChangeStartDate = (startDate: Date) => {
        const endDate = this.props.lineHeaderStore!.lineHeader!.endDate;
        this.changeDates(startDate, endDate);
    };

    private onChangeEndDate = (endDate: Date) => {
        const startDate = this.props.lineHeaderStore!.lineHeader!.startDate;
        this.changeDates(startDate, endDate);
    };

    private toggleIsEditing = () => {
        const isEditingDisabled = this.state.isEditingDisabled;
        if (!isEditingDisabled) {
            this.props.lineHeaderStore!.resetChanges();
        }
        this.toggleIsEditingDisabled();
        if (!isEditingDisabled) this.validateLineHeader();
    };

    private renderLineHeaderViewHeader = () => {
        const lineHeaderStore = this.props.lineHeaderStore;
        return (
            <div className={s.sidebarHeaderSection}>
                <SidebarHeader
                    isEditButtonVisible={!this.props.isNewLineHeader}
                    onEditButtonClick={this.toggleIsEditing}
                    isEditing={!this.state.isEditingDisabled}
                    shouldShowClosePromptMessage={lineHeaderStore!.isDirty}
                >
                    {this.props.isNewLineHeader
                        ? 'Luo uusi linjan otsikko'
                        : `Linjan otsikkotiedot`}
                </SidebarHeader>
            </div>
        );
    };

    private redirectToNewLineHeaderView = () => {
        const lineId = this.props.match!.params.id;
        const lineHeader = this.props.lineHeaderStore!.lineHeader;

        const newLineHeaderLink = routeBuilder
            .to(SubSites.newLineHeader, {
                startDate: new Date(lineHeader!.originalStartDate!).toISOString()
            })
            .toTarget(':id', lineId)
            .toLink();

        navigator.goTo(newLineHeaderLink);
    };

    render() {
        if (this.state.isLoading) {
            return (
                <div className={classnames(s.lineHeaderView, s.loaderContainer)}>
                    <Loader size={LoaderSize.MEDIUM} />
                </div>
            );
        }
        const lineHeader = this.props.lineHeaderStore!.lineHeader;

        if (!lineHeader) return null;

        const isEditingDisabled = this.state.isEditingDisabled;
        const onChange = this.onChangeLineHeaderProperty;
        const invalidPropertiesMap = this.state.invalidPropertiesMap;
        const isSaveButtonDisabled =
            this.state.isEditingDisabled ||
            !this.props.lineHeaderStore!.isDirty ||
            !this.isFormValid();

        return (
            <div className={s.lineHeaderView}>
                <div className={s.content}>
                    {this.renderLineHeaderViewHeader()}
                    <div className={classnames(s.lineHeaderForm, s.form)}>
                        <div className={s.flexRow}>
                            <TextContainer
                                label='LINJAN TUNNUS'
                                value={lineHeader.lineId}
                            />
                        </div>
                        <div className={s.flexRow}>
                            <InputContainer
                                disabled={isEditingDisabled}
                                label='VOIM.AST.PVM'
                                type='date'
                                value={lineHeader.startDate}
                                onChange={this.onChangeStartDate}
                                validationResult={
                                    invalidPropertiesMap['startDate']
                                }
                            />
                            <InputContainer
                                disabled={isEditingDisabled}
                                label='VIIM. VOIM.OLOPVM'
                                type='date'
                                value={lineHeader.endDate}
                                onChange={this.onChangeEndDate}
                                validationResult={
                                    invalidPropertiesMap['endDate']
                                }
                            />
                        </div>
                        <div className={s.flexRow}>
                            <InputContainer
                                disabled={isEditingDisabled}
                                label='LINJAN NIMI'
                                value={lineHeader.lineNameFi}
                                onChange={onChange('lineNameFi')}
                                validationResult={
                                    invalidPropertiesMap['lineNameFi']
                                }
                            />
                            <InputContainer
                                disabled={isEditingDisabled}
                                label='LINJAN LYHYT NIMI'
                                value={lineHeader.lineShortNameFi}
                                onChange={onChange('lineShortNameFi')}
                                validationResult={
                                    invalidPropertiesMap['lineShortNameFi']
                                }
                            />
                        </div>
                        <div className={s.flexRow}>
                            <InputContainer
                                disabled={isEditingDisabled}
                                label='LINJAN NIMI RUOTSIKSI'
                                value={lineHeader.lineNameSw}
                                onChange={onChange('lineNameSw')}
                                validationResult={
                                    invalidPropertiesMap['lineNameSw']
                                }
                            />
                            <InputContainer
                                disabled={isEditingDisabled}
                                label='LINJAN LYHYT NIMI RUOTSIKSI'
                                value={lineHeader.lineShortNameSw}
                                onChange={onChange('lineShortNameSw')}
                                validationResult={
                                    invalidPropertiesMap['lineShortNameSw']
                                }
                            />
                        </div>
                        <div className={s.flexRow}>
                            <InputContainer
                                disabled={isEditingDisabled}
                                label='LÄHTÖPAIKKA SUUNNASSA 1'
                                value={lineHeader.lineStartPlace1Fi}
                                onChange={onChange('lineStartPlace1Fi')}
                                validationResult={
                                    invalidPropertiesMap['lineStartPlace1Fi']
                                }
                            />
                            <InputContainer
                                disabled={isEditingDisabled}
                                label='LÄHTÖPAIKKA SUUNNASSA 1 RUOTSIKSI'
                                value={lineHeader.lineStartPlace1Sw}
                                onChange={onChange('lineStartPlace1Sw')}
                                validationResult={
                                    invalidPropertiesMap['lineStartPlace1Sw']
                                }
                            />
                        </div>
                        <div className={s.flexRow}>
                            <InputContainer
                                disabled={isEditingDisabled}
                                label='LÄHTÖPAIKKA SUUNNASSA 2'
                                value={lineHeader.lineStartPlace2Fi}
                                onChange={onChange('lineStartPlace2Fi')}
                                validationResult={
                                    invalidPropertiesMap['lineStartPlace2Fi']
                                }
                            />
                            <InputContainer
                                disabled={isEditingDisabled}
                                label='LÄHTÖPAIKKA SUUNNASSA 2 RUOTSIKSI'
                                value={lineHeader.lineStartPlace2Sw}
                                onChange={onChange('lineStartPlace2Sw')}
                                validationResult={
                                    invalidPropertiesMap['lineStartPlace2Sw']
                                }
                            />
                        </div>
                        <div className={s.flexRow}>
                            <TextContainer
                                label='MUOKANNUT'
                                value={lineHeader.modifiedBy}
                            />
                            <TextContainer
                                label='MUOKATTU PVM'
                                isTimeIncluded={true}
                                value={lineHeader.modifiedOn}
                            />
                        </div>
                    </div>
                    {!this.props.isNewLineHeader && isEditingDisabled && (
                        <Button
                            className={s.newLineHeaderButton}
                            type={ButtonType.SQUARE}
                            disabled={false}
                            onClick={() => this.redirectToNewLineHeaderView()}
                        >
                            Luo uusi linjan otsikko käyttäen tätä pohjana
                        </Button>
                    )}
                    <Button
                        onClick={this.save}
                        type={ButtonType.SAVE}
                        disabled={isSaveButtonDisabled}
                    >
                        {this.props.isNewLineHeader
                            ? 'Luo uusi linjan otsikko'
                            : 'Tallenna muutokset'}
                    </Button>
                </div>
            </div>
        );
    }
}

export default LineHeaderView;
