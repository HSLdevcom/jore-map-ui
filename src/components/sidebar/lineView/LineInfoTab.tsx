import React from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import TransitType from '~/enums/transitType';
import { LineStore } from '~/stores/lineStore';
import { CodeListStore } from '~/stores/codeListStore';
import { TransitToggleButtonBar, Dropdown } from '~/components/controls';
import InputContainer from '../InputContainer';
import * as s from './lineInfoTab.scss';

interface ILineInfoTabState {
    isLoading: boolean;
}

interface ILineInfoTabProps {
    lineStore?: LineStore;
    codeListStore?: CodeListStore;
    isEditingDisabled: boolean;
    isNewLine: boolean;
    onChange: (property: string) => (value: any) => void;
    invalidPropertiesMap: object;
}

@inject('lineStore', 'codeListStore')
@observer
class LineInfoTab extends React.Component<ILineInfoTabProps, ILineInfoTabState>{
    constructor(props: any) {
        super(props);
        this.state = {
            isLoading: true,
        };
    }

    private selectTransitType = (transitType: TransitType) => {
        this.props.lineStore!.updateLineProperty('transitType', transitType);
    }

    render() {
        const line = this.props.lineStore!.line;
        if (!line) return 'Error';

        const isEditingDisabled = this.props.isEditingDisabled;
        const onChange = this.props.onChange;
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
                            />
                        </div>
                    </div>
                    <div className={s.flexRow}>
                        <InputContainer
                            disabled={isEditingDisabled}
                            label='LINJAN TUNNUS'
                            value={line.id}
                            onChange={onChange('id')}
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
                            onChange={onChange('lineStartDate')}
                            validationResult={invalidPropertiesMap['lineStartDate']}
                        />
                    </div>
                    <div className={s.flexRow}>
                        <InputContainer
                            disabled={isEditingDisabled}
                            label='LINJAN VIIMEINEN VOIMASSAOLOPÄIVÄ'
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
                            items={this.props.codeListStore!.getCodeList('Joukkoliikennelaji')}
                            onChange={onChange('publicTransportType')}
                        />
                        <Dropdown
                            label='TILAAJAORGANISAATIO'
                            disabled={isEditingDisabled}
                            selected={line.clientOrganization}
                            items={this.props.codeListStore!.getCodeList('Tilaajaorganisaatio')}
                            onChange={onChange('clientOrganization')}
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
                        />
                    </div>
                </div>
            </div>
        </div>
        );
    }
}
export default LineInfoTab;
