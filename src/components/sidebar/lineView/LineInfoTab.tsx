import { inject, observer } from 'mobx-react';
import React from 'react';
import { Button, Dropdown, TransitToggleButtonBar } from '~/components/controls';
import InputContainer from '~/components/controls/InputContainer';
import TextContainer from '~/components/controls/TextContainer';
import ButtonType from '~/enums/buttonType';
import TransitType from '~/enums/transitType';
import ILineHeader from '~/models/ILineHeader';
import ISearchLine from '~/models/searchModels/ISearchLine';
import LineHeaderService from '~/services/lineHeaderService';
import LineService from '~/services/lineService';
import { CodeListStore } from '~/stores/codeListStore';
import { ErrorStore } from '~/stores/errorStore';
import { LineStore } from '~/stores/lineStore';
import { IValidationResult } from '~/validation/FormValidator';
import LineHeaderTable from './LineHeaderTable';
import * as s from './lineInfoTab.scss';

interface ILineInfoTabState {
    isLoading: boolean;
    lineHeaders: ILineHeader[];
    currentLineHeader?: ILineHeader;
}

interface ILineInfoTabProps {
    lineStore?: LineStore;
    codeListStore?: CodeListStore;
    errorStore?: ErrorStore;
    isEditingDisabled: boolean;
    isNewLine: boolean;
    isLineSaveButtonDisabled: boolean;
    onChangeLineProperty: (property: string) => (value: any) => void;
    invalidPropertiesMap: object;
    setValidatorResult: (property: string, validationResult: IValidationResult) => void;
    saveLine: () => void;
}

const transitTypeDefaultValueMap = {
    '1': '01',
    '3': '02',
    '4': '12',
    '2': '06',
    '7': '07'
};

@inject('lineStore', 'codeListStore', 'errorStore')
@observer
class LineInfoTab extends React.Component<ILineInfoTabProps, ILineInfoTabState> {
    private existingLines: ISearchLine[] = [];
    private mounted: boolean;

    constructor(props: any) {
        super(props);
        this.state = {
            isLoading: true,
            lineHeaders: []
        };
    }

    async componentWillMount() {
        const lineId = this.props.lineStore!.line!.id;
        const lineHeaders: ILineHeader[] = await LineHeaderService.fetchLineHeaders(lineId);
        this.initLineHeaderItems(lineHeaders);
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentDidMount() {
        if (this.props.isNewLine) {
            this.fetchAllLines();
        }
        this.mounted = true;
    }

    componentDidUpdate() {
        if (this.props.isNewLine) {
            this.fetchAllLines();
        }
    }

    private initLineHeaderItems = (lineHeaders: ILineHeader[]) => {
        if (this.mounted) {
            const currentTime = new Date().getTime();
            const currentLineHeader = lineHeaders.find(
                (lineHeader: ILineHeader) =>
                    currentTime > lineHeader.startDate!.getTime() &&
                    currentTime < lineHeader.endDate!.getTime()
            );
            this.setState({
                lineHeaders,
                currentLineHeader
            });
        }
    };

    private selectTransitType = (transitType: TransitType) => {
        this.props.onChangeLineProperty('transitType')(transitType);
        this.props.onChangeLineProperty('publicTransportType')(
            transitTypeDefaultValueMap[transitType]
        );
    };

    private isLineAlreadyFound = (lineId: string): boolean => {
        return Boolean(
            this.existingLines.find((searchLine: ISearchLine) => searchLine.id === lineId)
        );
    };

    private fetchAllLines = async () => {
        if (this.existingLines.length > 0) return;

        try {
            this.existingLines = await LineService.fetchAllSearchLines();
        } catch (e) {
            this.props.errorStore!.addError('Olemassa olevien linjojen haku ei onnistunut', e);
        }
    };

    private onChangeLineId = (lineId: string) => {
        this.props.onChangeLineProperty('id')(lineId);
        if (this.isLineAlreadyFound(lineId)) {
            const validationResult: IValidationResult = {
                isValid: false,
                errorMessage: `Linja ${lineId} on jo olemassa.`
            };
            this.props.setValidatorResult('id', validationResult);
        }
    };

    private validateDates = (startDate: Date, endDate: Date) => {
        this.props.onChangeLineProperty('lineStartDate')(startDate);
        this.props.onChangeLineProperty('lineEndDate')(endDate);
        // is end date before start date?
        if (endDate && endDate.getTime() < startDate.getTime()) {
            const validationResult: IValidationResult = {
                isValid: false,
                errorMessage: `Viimeinen voimassaolopäivä ei voi olla ennen voimaanastumispäivää.`
            };
            this.props.setValidatorResult('lineEndDate', validationResult);
        }
    };

    private onChangeStartDate = (startDate: Date) => {
        const endDate = this.props.lineStore!.line!.lineEndDate;
        this.validateDates(startDate, endDate);
    };

    private onChangeEndDate = (endDate: Date) => {
        const startDate = this.props.lineStore!.line!.lineStartDate;
        this.validateDates(startDate, endDate);
    };

    render() {
        const line = this.props.lineStore!.line;
        if (!line) return null;

        const isEditingDisabled = this.props.isEditingDisabled;
        const isUpdating = !this.props.isNewLine || this.props.isEditingDisabled;
        const onChange = this.props.onChangeLineProperty;
        const invalidPropertiesMap = this.props.invalidPropertiesMap;
        const selectedTransitTypes = line!.transitType ? [line!.transitType!] : [];

        return (
            <div className={s.lineInfoTabView}>
                <div className={s.form}>
                    <div className={s.flexRow}>
                        <div className={s.formItem}>
                            <div className={s.inputLabel}>VERKKO</div>
                            <TransitToggleButtonBar
                                selectedTransitTypes={selectedTransitTypes}
                                toggleSelectedTransitType={this.selectTransitType}
                                disabled={!this.props.isNewLine}
                                errorMessage={
                                    !line!.transitType ? 'Verkon tyyppi täytyy valita.' : undefined
                                }
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
                            capitalizeInput={true}
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
                            label='LINJAN VOIM.AST.PVM'
                            type='date'
                            value={line.lineStartDate}
                            onChange={this.onChangeStartDate}
                            validationResult={invalidPropertiesMap['lineStartDate']}
                        />
                        <InputContainer
                            disabled={isEditingDisabled}
                            label='LINJAN VIIM. VOIM.OLOPVM'
                            type='date'
                            value={line.lineEndDate}
                            onChange={this.onChangeEndDate}
                            validationResult={invalidPropertiesMap['lineEndDate']}
                        />
                    </div>
                    <div className={s.flexRow}>
                        <TextContainer
                            label={'LINJAN VOIMASSAOLEVA OTSIKKO'}
                            value={
                                this.state.currentLineHeader
                                    ? this.state.currentLineHeader.lineNameFi
                                    : 'Ei voimassa olevaa otsikkoa.'
                            }
                        />
                    </div>
                    <div className={s.flexRow}>
                        <Dropdown
                            label='JOUKKOLIIKENNELAJI'
                            disabled={isEditingDisabled}
                            selected={line.publicTransportType}
                            emptyItem={{
                                value: '',
                                label: ''
                            }}
                            items={this.props.codeListStore!.getDropdownItemList(
                                'Joukkoliikennelaji'
                            )}
                            onChange={onChange('publicTransportType')}
                            validationResult={invalidPropertiesMap['publicTransportType']}
                        />
                        <Dropdown
                            label='TILAAJAORGANISAATIO'
                            disabled={isEditingDisabled}
                            selected={line.clientOrganization}
                            items={this.props.codeListStore!.getDropdownItemList(
                                'Tilaajaorganisaatio'
                            )}
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
                                label: ''
                            }}
                            items={this.props.codeListStore!.getDropdownItemList(
                                'Joukkoliikennekohde'
                            )}
                            onChange={onChange('publicTransportDestination')}
                            validationResult={invalidPropertiesMap['publicTransportDestination']}
                        />
                        <Dropdown
                            label='LINJAN KORVAAVA TYYPPI'
                            disabled={isEditingDisabled}
                            selected={line.lineReplacementType}
                            emptyItem={{
                                value: '',
                                label: ''
                            }}
                            items={this.props.codeListStore!.getDropdownItemList(
                                'LinjanKorvaavaTyyppi'
                            )}
                            onChange={onChange('lineReplacementType')}
                            validationResult={invalidPropertiesMap['lineReplacementType']}
                        />
                    </div>
                    <div className={s.flexRow}>
                        <InputContainer
                            disabled={isEditingDisabled}
                            label='VAIHTOAJAN PIDENNYS (min)'
                            type='number'
                            value={line.exchangeTime}
                            onChange={onChange('exchangeTime')}
                            validationResult={invalidPropertiesMap['exchangeTime']}
                        />
                    </div>
                    <div className={s.flexRow}>
                        <TextContainer label='MUOKANNUT' value={line.modifiedBy} />
                        <TextContainer
                            label='MUOKATTU PVM'
                            isTimeIncluded={true}
                            value={line.modifiedOn}
                        />
                    </div>
                    <Button
                        onClick={this.props.saveLine}
                        type={ButtonType.SAVE}
                        disabled={this.props.isLineSaveButtonDisabled}
                    >
                        {this.props.isNewLine ? 'Luo uusi linja' : 'Tallenna linja'}
                    </Button>
                </div>
                {!this.props.isNewLine && (
                    <LineHeaderTable
                        lineHeaders={this.state.lineHeaders}
                        currentLineHeader={this.state.currentLineHeader}
                        lineId={this.props.lineStore!.line!.id}
                    />
                )}
            </div>
        );
    }
}
export default LineInfoTab;
