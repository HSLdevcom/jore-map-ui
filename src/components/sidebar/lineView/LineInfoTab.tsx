import React from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import TransitType from '~/enums/transitType';
import { LineStore } from '~/stores/lineStore';
import { CodeListStore } from '~/stores/codeListStore';
import { ErrorStore } from '~/stores/errorStore';
import LineService from '~/services/lineService';
import ISearchLine from '~/models/searchModels/ISearchLine';
import { IValidationResult } from '~/validation/FormValidator';
import { TransitToggleButtonBar, Dropdown } from '~/components/controls';
import InputContainer from '../InputContainer';
import * as s from './lineInfoTab.scss';

interface ILineInfoTabState {
    isLoading: boolean;
}

interface ILineInfoTabProps {
    lineStore?: LineStore;
    codeListStore?: CodeListStore;
    errorStore?: ErrorStore;
    isEditingDisabled: boolean;
    isNewLine: boolean;
    onChangeLineProperty: (property: string) => (value: any) => void;
    invalidPropertiesMap: object;
    setValidatorResult: (property: string, validationResult: IValidationResult) => void;
}

@inject('lineStore', 'codeListStore', 'errorStore')
@observer
class LineInfoTab extends React.Component<ILineInfoTabProps, ILineInfoTabState>{
    private existingLines: ISearchLine[] = [];

    constructor(props: any) {
        super(props);
        this.state = {
            isLoading: true,
        };
    }

    componentDidMount() {
        if (this.props.isNewLine) {
            this.fetchAllLines();
        }
    }

    componentDidUpdate() {
        if (this.props.isNewLine) {
            this.fetchAllLines();
        }
    }

    private selectTransitType = (transitType: TransitType) => {
        this.props.onChangeLineProperty('transitType')(transitType);
    }

    private isLineAlreadyFound = (lineId: string): boolean => {
        return Boolean(this.existingLines
            .find((searchLine: ISearchLine) => searchLine.id === lineId));
    }

    private fetchAllLines = async () => {
        if (this.existingLines.length > 0) return;

        try {
            this.existingLines = await LineService.fetchAllSearchLines();
        } catch (e) {
            this.props.errorStore!.addError('Olemassa olevien linjojen haku ei onnistunut', e);
        }
    }

    private onChangeLineId = (lineId: string) => {
        this.props.onChangeLineProperty('id')(lineId);
        if (this.isLineAlreadyFound(lineId)) {
            const validationResult: IValidationResult = {
                isValid: false,
                errorMessage: `Linja ${lineId} on jo olemassa.`,
            };
            this.props.setValidatorResult('id', validationResult);
        }
    }

    private validateDates = (startDate: Date, endDate: Date) => {
        this.props.onChangeLineProperty('lineStartDate')(startDate);
        this.props.onChangeLineProperty('lineEndDate')(endDate);
        // is end date before start date?
        if (endDate && endDate.getTime() < startDate.getTime()) {
            const validationResult: IValidationResult = {
                isValid: false,
                errorMessage: `Viimeinen voimassaolopäivä ei voi olla ennen voimaanastumispäivää.`,
            };
            this.props.setValidatorResult('lineEndDate', validationResult);
        }
    }

    private onChangeStartDate = (startDate: Date) => {
        const endDate = this.props.lineStore!.line!.lineEndDate;
        this.validateDates(startDate, endDate);
    }

    private onChangeEndDate = (endDate: Date) => {
        const startDate = this.props.lineStore!.line!.lineStartDate;
        this.validateDates(startDate, endDate);
    }

    render() {
        const line = this.props.lineStore!.line;
        if (!line) return null;

        const isEditingDisabled = this.props.isEditingDisabled;
        const isUpdating = !this.props.isNewLine || this.props.isEditingDisabled;
        const onChange = this.props.onChangeLineProperty;
        const invalidPropertiesMap = this.props.invalidPropertiesMap;
        const selectedTransitTypes = line!.transitType ? [line!.transitType!] : [];

        return (
        <div className={classnames(s.lineInfoTabView, s.form)}>
            <div className={s.content}>
                <div className={s.formSection}>
                    <div className={s.flexRow}>
                        <div className={s.formItem}>
                            <div className={s.inputLabel}>
                                VERKKO
                            </div>
                            <TransitToggleButtonBar
                                selectedTransitTypes={selectedTransitTypes}
                                toggleSelectedTransitType={this.selectTransitType}
                                disabled={!this.props.isNewLine}
                                errorMessage={!line!.transitType ?
                                    'Verkon tyyppi täytyy valita.' : undefined}
                            />
                        </div>
                    </div>
                    <div className={s.flexRow}>
                        <InputContainer
                            disabled={isUpdating}
                            label='LINJAN TUNNUS'
                            value={line.id}
                            onChange={this.onChangeLineId}
                            validationResult={invalidPropertiesMap['id']}
                        />
                        <InputContainer
                            disabled={isEditingDisabled}
                            label='LINJAN PERUS REITTI'
                            value={line.lineBasicRoute}
                            onChange={onChange('lineBasicRoute')}
                            validationResult={invalidPropertiesMap['lineBasicRoute']}
                        />
                    </div>
                    <div className={s.flexRow}>
                        <InputContainer
                            disabled={isEditingDisabled}
                            label='LINJAN VOIMAANASTUMISPÄIVÄ'
                            type='date'
                            value={line.lineStartDate}
                            onChange={this.onChangeStartDate}
                            validationResult={invalidPropertiesMap['lineStartDate']}
                        />
                    </div>
                    <div className={s.flexRow}>
                        <InputContainer
                            disabled={isEditingDisabled}
                            label='LINJAN VIIMEINEN VOIMASSAOLOPÄIVÄ'
                            type='date'
                            value={line.lineEndDate}
                            onChange={this.onChangeEndDate}
                            validationResult={invalidPropertiesMap['lineEndDate']}
                        />
                    </div>
                    <div className={s.flexRow}>
                        <Dropdown
                            label='JOUKKOLIIKENNELAJI'
                            disabled={isEditingDisabled}
                            selected={line.publicTransportType}
                            emptyItem={{
                                value: '',
                                label: '',
                            }}
                            items={this.props.codeListStore!.getCodeList('Joukkoliikennelaji')}
                            onChange={onChange('publicTransportType')}
                            validationResult={invalidPropertiesMap['publicTransportType']}
                        />
                        <Dropdown
                            label='TILAAJAORGANISAATIO'
                            disabled={isEditingDisabled}
                            selected={line.clientOrganization}
                            items={this.props.codeListStore!.getCodeList('Tilaajaorganisaatio')}
                            onChange={onChange('clientOrganization')}
                            validationResult={invalidPropertiesMap['clientOrganization']}
                        />
                    </div>
                    <div className={s.flexRow}>
                        <Dropdown
                            label='JOUKKOLIIKENNEKOHDE'
                            disabled={isEditingDisabled}
                            selected={line.publicTransportDestination}
                            emptyItem={{
                                value: '',
                                label: '',
                            }}
                            items={this.props.codeListStore!.getCodeList('Joukkoliikennekohde')}
                            onChange={onChange('publicTransportDestination')}
                            validationResult={invalidPropertiesMap['publicTransportDestination']}
                        />
                        <Dropdown
                            label='LINJAN KORVAAVA TYYPPI'
                            disabled={isEditingDisabled}
                            selected={line.lineReplacementType}
                            emptyItem={{
                                value: '',
                                label: '',
                            }}
                            items={this.props.codeListStore!.getCodeList('LinjanKorvaavaTyyppi')}
                            onChange={onChange('lineReplacementType')}
                            validationResult={invalidPropertiesMap['lineReplacementType']}
                        />
                    </div>
                    <div className={s.flexRow}>
                        <InputContainer
                            disabled={isEditingDisabled}
                            label='VAIHTOAJAN PIDENNYS'
                            type='number'
                            value={line.exchangeTime}
                            onChange={onChange('exchangeTime')}
                            validationResult={invalidPropertiesMap['exchangeTime']}
                        />
                    </div>
                </div>
            </div>
        </div>
        );
    }
}
export default LineInfoTab;
