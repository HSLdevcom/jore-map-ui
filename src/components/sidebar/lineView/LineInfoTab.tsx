import { inject, observer } from 'mobx-react';
import React from 'react';
import { Dropdown, TransitToggleButtonBar } from '~/components/controls';
import InputContainer from '~/components/controls/InputContainer';
import TextContainer from '~/components/controls/TextContainer';
import SaveButton from '~/components/shared/SaveButton';
import TransitType from '~/enums/transitType';
import { ILine } from '~/models';
import LineService from '~/services/lineService';
import { CodeListStore } from '~/stores/codeListStore';
import { ConfirmStore } from '~/stores/confirmStore';
import { ErrorStore } from '~/stores/errorStore';
import { LineHeaderMassEditStore } from '~/stores/lineHeaderMassEditStore';
import { LineStore } from '~/stores/lineStore';
import { NavigationStore } from '~/stores/navigationStore';
import SidebarHeader from '../SidebarHeader';
import LineHeaderTable from './LineHeaderTable';
import * as s from './lineInfoTab.scss';

interface ILineInfoTabState {
    isLoading: boolean;
}

interface ILineInfoTabProps {
    lineStore?: LineStore;
    codeListStore?: CodeListStore;
    confirmStore?: ConfirmStore;
    errorStore?: ErrorStore;
    lineHeaderMassEditStore?: LineHeaderMassEditStore;
    navigationStore?: NavigationStore;
    isEditingDisabled: boolean;
    isLineSaveButtonDisabled: boolean;
    saveLine: () => void;
    isNewLine: boolean;
}

const transitTypeDefaultValueMap = {
    '1': '01',
    '3': '02',
    '4': '12',
    '2': '06',
    '7': '07'
};

@inject(
    'lineStore',
    'codeListStore',
    'errorStore',
    'lineHeaderMassEditStore',
    'navigationStore',
    'confirmStore'
)
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

    private editLinePrompt = () => {
        if (!this.props.lineHeaderMassEditStore!.isEditingDisabled) {
            this.props.lineHeaderMassEditStore!.toggleIsEditingDisabled();
        }
        this.props.lineStore!.toggleIsEditingDisabled();
    };

    render() {
        const lineStore = this.props.lineStore!;
        const line = lineStore!.line;
        if (!line) return null;

        const isEditingDisabled = this.props.isEditingDisabled;
        const isUpdating = !lineStore.isNewLine || this.props.isEditingDisabled;
        const onChange = this.onChangeLineProperty;
        const invalidPropertiesMap = lineStore.invalidPropertiesMap;
        const selectedTransitTypes = line!.transitType ? [line!.transitType!] : [];
        return (
            <div className={s.lineInfoTabView}>
                <SidebarHeader
                    isEditButtonVisible={!this.props.isNewLine}
                    onEditButtonClick={this.editLinePrompt}
                    isEditing={!lineStore!.isEditingDisabled}
                    isCloseButtonVisible={true}
                    isBackButtonVisible={true}
                >
                    {this.props.isNewLine ? 'Luo uusi linja' : `Linja ${lineStore!.line!.id}`}
                </SidebarHeader>
                <div className={s.form}>
                    <div className={s.flexRow}>
                        <div className={s.formItem}>
                            <div className={s.inputLabel}>VERKKO</div>
                            <TransitToggleButtonBar
                                selectedTransitTypes={selectedTransitTypes}
                                toggleSelectedTransitType={this.selectTransitType}
                                disabled={!lineStore.isNewLine}
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
                    <SaveButton
                        onClick={this.props.saveLine}
                        disabled={this.props.isLineSaveButtonDisabled}
                    >
                        {this.props.lineStore!.isNewLine ? 'Luo uusi linja' : 'Tallenna linja'}
                    </SaveButton>
                </div>
                <div className={s.sectionDivider} />
                {!this.props.lineStore!.isNewLine && (
                    <LineHeaderTable lineId={this.props.lineStore!.line!.id} />
                )}
            </div>
        );
    }
}
export default LineInfoTab;
