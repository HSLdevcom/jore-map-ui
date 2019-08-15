import React from 'react';
import classnames from 'classnames';
import Moment from 'moment';
import _ from 'lodash';
import { observer, inject } from 'mobx-react';
import { match } from 'react-router';
import { ErrorStore } from '~/stores/errorStore';
import { AlertStore } from '~/stores/alertStore';
import InputContainer from '~/components/controls/InputContainer';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import { ILineTopic } from '~/models';
import lineTopicValidationModel from '~/models/validationModels/lineTopicValidationModel';
import { IValidationResult } from '~/validation/FormValidator';
import ButtonType from '~/enums/buttonType';
import { Button } from '~/components/controls';
import Loader, { LoaderSize } from '~/components/shared/loader/Loader';
import TextContainer from '~/components/controls/TextContainer';
import ViewFormBase from '~/components/shared/inheritedComponents/ViewFormBase';
import LineTopicFactory from '~/factories/lineTopicFactory';
import LineTopicService from '~/services/lineTopicService';
import { LineTopicStore } from '~/stores/lineTopicStore';
import SidebarHeader from '../../SidebarHeader';
import * as s from './lineTopicView.scss';

interface ILineTopicViewProps {
    alertStore?: AlertStore;
    errorStore?: ErrorStore;
    lineTopicStore?: LineTopicStore;
    match?: match<any>;
    isNewLineTopic: boolean;
}

interface ILineTopicViewState {
    isLoading: boolean;
    invalidPropertiesMap: object;
    isEditingDisabled: boolean;
    reservedStartDates: string[];
}

@inject('lineTopicStore', 'errorStore', 'alertStore')
@observer
class LineTopicView extends ViewFormBase<
    ILineTopicViewProps,
    ILineTopicViewState
> {
    constructor(props: ILineTopicViewProps) {
        super(props);
        this.state = {
            isLoading: true,
            invalidPropertiesMap: {},
            isEditingDisabled: !props.isNewLineTopic,
            reservedStartDates: []
        };
    }

    componentDidMount() {
        super.componentDidMount();
        this.initialize();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.props.lineTopicStore!.clear();
    }

    private initialize = async () => {
        if (this.props.isNewLineTopic) {
            await this.createNewLine();
        } else {
            await this.initExistingLine();
        }
        if (this.props.lineTopicStore!.lineTopic) {
            await this.queryOtherLineTopics();
            this.validateLineTopic();
            this.setState({
                isLoading: false
            });
        }
    };

    private queryOtherLineTopics = async () => {
        const lineTopic = this.props.lineTopicStore!.lineTopic;
        const allLineTopics: ILineTopic[] = await LineTopicService.fetchLineTopics(
            lineTopic!.lineId
        );
        const reservedStartDates = _.chain(allLineTopics)
            .map((lt: ILineTopic) => Moment(lt.startDate).format())
            .filter(
                (startDate: string) =>
                    startDate !== Moment(lineTopic!.startDate).format()
            )
            .value();

        this.setState({
            reservedStartDates
        });
    };

    private createNewLine = async () => {
        try {
            const lineId = this.props.match!.params.id;
            const newLineTopic = LineTopicFactory.createNewLineTopic(lineId);
            this.props.lineTopicStore!.setLineTopic(newLineTopic);
        } catch (e) {
            this.props.errorStore!.addError(
                'Uuden linjan nimen luonti epäonnistui',
                e
            );
        }
    };

    private initExistingLine = async () => {
        await this.fetchLine();
    };

    private fetchLine = async () => {
        const lineId = this.props.match!.params.id;
        const startDate = this.props.match!.params.startDate;

        try {
            const lineTopic = await LineTopicService.fetchLineTopic(
                lineId,
                startDate
            );
            this.props.lineTopicStore!.setLineTopic(lineTopic);
        } catch (e) {
            this.props.errorStore!.addError(
                'Linja otsikon haku epäonnistui.',
                e
            );
        }
    };

    private validateLineTopic = () => {
        this.validateAllProperties(
            lineTopicValidationModel,
            this.props.lineTopicStore!.lineTopic
        );
    };

    private save = async () => {
        this.setState({ isLoading: true });

        const lineTopic = this.props.lineTopicStore!.lineTopic;
        try {
            if (this.props.isNewLineTopic) {
                await LineTopicService.createLineTopic(lineTopic!);
            } else {
                await LineTopicService.updateLineTopic(lineTopic!);
            }

            this.props.alertStore!.setFadeMessage('Tallennettu!');
        } catch (e) {
            this.props.errorStore!.addError(`Tallennus epäonnistui`, e);
            return;
        }
        if (this.props.isNewLineTopic) {
            this.navigateToNewLineTopic();
            return;
        }
        this.setState({
            isEditingDisabled: true,
            invalidPropertiesMap: {},
            isLoading: false
        });
    };

    private navigateToNewLineTopic = () => {
        const lineTopic = this.props.lineTopicStore!.lineTopic;
        const lineTopicViewLink = routeBuilder
            .to(SubSites.lineTopic)
            .toTarget(':id', lineTopic!.lineId)
            .toTarget(':startDate', Moment(lineTopic!.startDate).format())
            .toLink();
        navigator.goTo(lineTopicViewLink);
    };

    private onChangeLineTopicProperty = (property: keyof ILineTopic) => (
        value: any
    ) => {
        this.props.lineTopicStore!.updateLineTopicProperty(property, value);
        this.validateProperty(
            lineTopicValidationModel[property],
            property,
            value
        );
    };

    private changeDates = (
        startDate: Date | undefined,
        endDate: Date | undefined
    ) => {
        this.onChangeLineTopicProperty('startDate')(startDate);
        this.onChangeLineTopicProperty('endDate')(endDate);
        this.validateDates(startDate, endDate);
    };
    private validateDates = (
        startDate: Date | undefined,
        endDate: Date | undefined
    ) => {
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
        const endDate = this.props.lineTopicStore!.lineTopic!.endDate;
        this.changeDates(startDate, endDate);
    };

    private onChangeEndDate = (endDate: Date) => {
        const startDate = this.props.lineTopicStore!.lineTopic!.startDate;
        this.changeDates(startDate, endDate);
    };

    private toggleIsEditing = () => {
        const isEditingDisabled = this.state.isEditingDisabled;
        if (!isEditingDisabled) {
            this.props.lineTopicStore!.resetChanges();
        }
        this.toggleIsEditingDisabled();
        if (!isEditingDisabled) this.validateLineTopic();
    };

    private renderLineTopicViewHeader = () => {
        const lineTopicStore = this.props.lineTopicStore;
        return (
            <div className={s.sidebarHeaderSection}>
                <SidebarHeader
                    isEditButtonVisible={!this.props.isNewLineTopic}
                    onEditButtonClick={this.toggleIsEditing}
                    isEditing={!this.state.isEditingDisabled}
                    shouldShowClosePromptMessage={lineTopicStore!.isDirty}
                >
                    {this.props.isNewLineTopic
                        ? 'Luo uusi linjan otsikko'
                        : `Linjan otsikkotiedot`}
                </SidebarHeader>
            </div>
        );
    };

    render() {
        if (this.state.isLoading) {
            return (
                <div className={classnames(s.lineTopicView, s.loaderContainer)}>
                    <Loader size={LoaderSize.MEDIUM} />
                </div>
            );
        }
        const lineTopic = this.props.lineTopicStore!.lineTopic;

        if (!lineTopic) return null;

        const isEditingDisabled = this.state.isEditingDisabled;
        const onChange = this.onChangeLineTopicProperty;
        const invalidPropertiesMap = this.state.invalidPropertiesMap;
        const isSaveButtonDisabled =
            this.state.isEditingDisabled ||
            !this.props.lineTopicStore!.isDirty ||
            !this.isFormValid();

        return (
            <div className={s.lineTopicView}>
                <div className={s.content}>
                    {this.renderLineTopicViewHeader()}
                    <div className={classnames(s.lineTopicForm, s.form)}>
                        <div className={s.flexRow}>
                            <TextContainer
                                label='LINJAN TUNNUS'
                                value={lineTopic.lineId}
                            />
                        </div>
                        <div className={s.flexRow}>
                            <InputContainer
                                disabled={isEditingDisabled}
                                label='VOIM.AST.PVM'
                                type='date'
                                value={lineTopic.startDate}
                                onChange={this.onChangeStartDate}
                                validationResult={
                                    invalidPropertiesMap['startDate']
                                }
                            />
                            <InputContainer
                                disabled={isEditingDisabled}
                                label='VIIM. VOIM.OLOPVM'
                                type='date'
                                value={lineTopic.endDate}
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
                                value={lineTopic.lineNameFi}
                                onChange={onChange('lineNameFi')}
                                validationResult={
                                    invalidPropertiesMap['lineNameFi']
                                }
                            />
                            <InputContainer
                                disabled={isEditingDisabled}
                                label='LINJAN LYHYT NIMI'
                                value={lineTopic.lineShortNameFi}
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
                                value={lineTopic.lineNameSw}
                                onChange={onChange('lineNameSw')}
                                validationResult={
                                    invalidPropertiesMap['lineNameSw']
                                }
                            />
                            <InputContainer
                                disabled={isEditingDisabled}
                                label='LINJAN LYHYT NIMI RUOTSIKSI'
                                value={lineTopic.lineShortNameSw}
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
                                value={lineTopic.lineStartPlace1Fi}
                                onChange={onChange('lineStartPlace1Fi')}
                                validationResult={
                                    invalidPropertiesMap['lineStartPlace1Fi']
                                }
                            />
                            <InputContainer
                                disabled={isEditingDisabled}
                                label='LÄHTÖPAIKKA SUUNNASSA 1 RUOTSIKSI'
                                value={lineTopic.lineStartPlace1Sw}
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
                                value={lineTopic.lineStartPlace2Fi}
                                onChange={onChange('lineStartPlace2Fi')}
                                validationResult={
                                    invalidPropertiesMap['lineStartPlace2Fi']
                                }
                            />
                            <InputContainer
                                disabled={isEditingDisabled}
                                label='LÄHTÖPAIKKA SUUNNASSA 2 RUOTSIKSI'
                                value={lineTopic.lineStartPlace2Sw}
                                onChange={onChange('lineStartPlace2Sw')}
                                validationResult={
                                    invalidPropertiesMap['lineStartPlace2Sw']
                                }
                            />
                        </div>
                        <div className={s.flexRow}>
                            <TextContainer
                                label='MUOKANNUT'
                                value={lineTopic.modifiedBy}
                            />
                            <TextContainer
                                label='MUOKATTU PVM'
                                isTimeIncluded={true}
                                value={lineTopic.modifiedOn}
                            />
                        </div>
                    </div>
                    <Button
                        onClick={this.save}
                        type={ButtonType.SAVE}
                        disabled={isSaveButtonDisabled}
                    >
                        {this.props.isNewLineTopic
                            ? 'Luo uusi linjan otsikko'
                            : 'Tallenna muutokset'}
                    </Button>
                </div>
            </div>
        );
    }
}

export default LineTopicView;
