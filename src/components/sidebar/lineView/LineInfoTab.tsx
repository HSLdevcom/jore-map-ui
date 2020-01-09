import { inject, observer } from 'mobx-react';
import React from 'react';
import { Button, Dropdown, TransitToggleButtonBar } from '~/components/controls';
import InputContainer from '~/components/controls/InputContainer';
import TextContainer from '~/components/controls/TextContainer';
import ButtonType from '~/enums/buttonType';
import TransitType from '~/enums/transitType';
import { ILine } from '~/models';
import LineService from '~/services/lineService';
import { CodeListStore } from '~/stores/codeListStore';
import { ErrorStore } from '~/stores/errorStore';
import { LineStore } from '~/stores/lineStore';
import LineHeaderTable from './LineHeaderTable';
import * as s from './lineInfoTab.scss';

interface ILineInfoTabState {
    isLoading: boolean;
}

interface ILineInfoTabProps {
    lineStore?: LineStore;
    codeListStore?: CodeListStore;
    errorStore?: ErrorStore;
    isEditingDisabled: boolean;
    isLineSaveButtonDisabled: boolean;
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
    constructor(props: any) {
        super(props);
        this.state = {
            isLoading: true
        };
    }

    componentDidMount() {
        if (this.props.lineStore!.isNewLine) {
            this.fetchAllLines();
        }
    }

    componentDidUpdate() {
        if (this.props.lineStore!.isNewLine) {
            this.fetchAllLines();
        }
    }

    private selectTransitType = (transitType: TransitType) => {
        const lineStore = this.props.lineStore!;
        lineStore.updateLineProperty('transitType', transitType);
        lineStore.updateLineProperty(
            'publicTransportType',
            transitTypeDefaultValueMap[transitType]
        );
    };

    private fetchAllLines = async () => {
        if (this.props.lineStore!.existingLines.length > 0) return;

        try {
            const existingLines = await LineService.fetchAllSearchLines();
            this.props.lineStore!.setExistingLines(existingLines);
        } catch (e) {
            this.props.errorStore!.addError('Olemassa olevien linjojen haku ei onnistunut', e);
        }
    };

    private onChangeLineProperty = (property: keyof ILine) => (value: any) => {
        this.props.lineStore!.updateLineProperty(property, value);
    };

    render() {
        const line = this.props.lineStore!.line;
        if (!line) return null;

        const isEditingDisabled = this.props.isEditingDisabled;
        const isUpdating = !this.props.lineStore!.isNewLine || this.props.isEditingDisabled;
        const onChange = this.onChangeLineProperty;
        const invalidPropertiesMap = this.props.lineStore!.invalidPropertiesMap;
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
                                disabled={!this.props.lineStore!.isNewLine}
                                errorMessage={
                                    invalidPropertiesMap['transitType'] &&
                                    !invalidPropertiesMap['transitType'].isValid
                                        ? 'Verkon tyyppi täytyy valita.'
                                        : undefined
                                }
                            />
                        </div>
                    </div>
                    <div className={s.flexRow}>
                        <InputContainer
                            disabled={isUpdating}
                            label='LINJAN TUNNUS'
                            value={line.id}
                            onChange={onChange('id')}
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
                            onChange={onChange('lineStartDate')}
                            validationResult={invalidPropertiesMap['lineStartDate']}
                        />
                        <InputContainer
                            disabled={isEditingDisabled}
                            label='LINJAN VIIM. VOIM.OLOPVM'
                            type='date'
                            value={line.lineEndDate}
                            onChange={onChange('lineEndDate')}
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
                        <InputContainer
                            disabled={true}
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
                        {this.props.lineStore!.isNewLine ? 'Luo uusi linja' : 'Tallenna linja'}
                    </Button>
                </div>
                {!this.props.lineStore!.isNewLine && (
                    <LineHeaderTable lineId={this.props.lineStore!.line!.id} />
                )}
            </div>
        );
    }
}
export default LineInfoTab;
