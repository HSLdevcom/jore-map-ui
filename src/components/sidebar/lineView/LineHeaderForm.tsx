import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { match } from 'react-router';
import { Button } from '~/components/controls';
import InputContainer from '~/components/controls/InputContainer';
import TextContainer from '~/components/controls/TextContainer';
import ButtonType from '~/enums/buttonType';
import { ILineHeader } from '~/models';
import { AlertStore } from '~/stores/alertStore';
import { ErrorStore } from '~/stores/errorStore';
import { LineHeaderMassEditStore } from '~/stores/lineHeaderMassEditStore';
import SidebarHeader from '../SidebarHeader';
import * as s from './lineHeaderForm.scss';

interface ILineHeaderViewProps {
    lineHeader: ILineHeader;
    isEditingDisabled: boolean;
    isNewLineHeader: boolean;
    invalidPropertiesMap: object;
    onChangeLineHeaderProperty: (property: keyof ILineHeader, value: any) => void;
    createNewLineHeaderWithCopy: () => void;
    lineHeaderMassEditStore?: LineHeaderMassEditStore;
    alertStore?: AlertStore;
    errorStore?: ErrorStore;
    match?: match<any>;
}

@inject('lineHeaderMassEditStore', 'alertStore', 'errorStore')
@observer
class LineHeaderView extends React.Component<ILineHeaderViewProps> {
    private onChangeLineHeaderProperty = (property: keyof ILineHeader) => (value: any) => {
        this.props.onChangeLineHeaderProperty(property, value);
    };

    private createNewLineHeaderWithCopy = () => {
        this.props.createNewLineHeaderWithCopy();
    };

    private closeLineHeader = () => {
        this.props.lineHeaderMassEditStore!.setSelectedLineHeaderId(null);
    };

    render() {
        const { lineHeader, isEditingDisabled, isNewLineHeader, invalidPropertiesMap } = this.props;

        if (!lineHeader) return null;

        const onChangeLineHeaderProperty = this.onChangeLineHeaderProperty;
        return (
            <div className={classnames(s.lineHeaderForm, s.form)}>
                <SidebarHeader
                    hideBackButton={true}
                    isEditButtonVisible={false}
                    onCloseButtonClick={this.closeLineHeader}
                >
                    Linjan otsikko {lineHeader.lineNameFi}
                </SidebarHeader>
                <div className={s.flexRow}>
                    <TextContainer label='LINJAN TUNNUS' value={lineHeader.lineId} />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        disabled={true}
                        label='VOIM.AST.PVM'
                        type='date'
                        value={lineHeader.startDate}
                        validationResult={invalidPropertiesMap['startDate']}
                    />
                    <InputContainer
                        disabled={true}
                        label='VIIM. VOIM.OLOPVM'
                        type='date'
                        value={lineHeader.endDate}
                        validationResult={invalidPropertiesMap['endDate']}
                    />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        disabled={isEditingDisabled}
                        label='LINJAN NIMI'
                        value={lineHeader.lineNameFi}
                        onChange={onChangeLineHeaderProperty('lineNameFi')}
                        validationResult={invalidPropertiesMap['lineNameFi']}
                    />
                    <InputContainer
                        disabled={isEditingDisabled}
                        label='LINJAN LYHYT NIMI'
                        value={lineHeader.lineShortNameFi}
                        onChange={onChangeLineHeaderProperty('lineShortNameFi')}
                        validationResult={invalidPropertiesMap['lineShortNameFi']}
                    />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        disabled={isEditingDisabled}
                        label='LINJAN NIMI RUOTSIKSI'
                        value={lineHeader.lineNameSw}
                        onChange={onChangeLineHeaderProperty('lineNameSw')}
                        validationResult={invalidPropertiesMap['lineNameSw']}
                    />
                    <InputContainer
                        disabled={isEditingDisabled}
                        label='LINJAN LYHYT NIMI RUOTSIKSI'
                        value={lineHeader.lineShortNameSw}
                        onChange={onChangeLineHeaderProperty('lineShortNameSw')}
                        validationResult={invalidPropertiesMap['lineShortNameSw']}
                    />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        disabled={isEditingDisabled}
                        label='LÄHTÖPAIKKA SUUNTA 1'
                        value={lineHeader.lineStartPlace1Fi}
                        onChange={onChangeLineHeaderProperty('lineStartPlace1Fi')}
                        validationResult={invalidPropertiesMap['lineStartPlace1Fi']}
                    />
                    <InputContainer
                        disabled={isEditingDisabled}
                        label='LÄHTÖPAIKKA SUUNTA 1 RUOTSIKSI'
                        value={lineHeader.lineStartPlace1Sw}
                        onChange={onChangeLineHeaderProperty('lineStartPlace1Sw')}
                        validationResult={invalidPropertiesMap['lineStartPlace1Sw']}
                    />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        disabled={isEditingDisabled}
                        label='LÄHTÖPAIKKA SUUNTA 2'
                        value={lineHeader.lineStartPlace2Fi}
                        onChange={onChangeLineHeaderProperty('lineStartPlace2Fi')}
                        validationResult={invalidPropertiesMap['lineStartPlace2Fi']}
                    />
                    <InputContainer
                        disabled={isEditingDisabled}
                        label='LÄHTÖPAIKKA SUUNTA 2 RUOTSIKSI'
                        value={lineHeader.lineStartPlace2Sw}
                        onChange={onChangeLineHeaderProperty('lineStartPlace2Sw')}
                        validationResult={invalidPropertiesMap['lineStartPlace2Sw']}
                    />
                </div>
                <div className={s.flexRow}>
                    <TextContainer label='MUOKANNUT' value={lineHeader.modifiedBy} />
                    <TextContainer
                        label='MUOKATTU PVM'
                        isTimeIncluded={true}
                        value={lineHeader.modifiedOn}
                    />
                </div>
                {!isNewLineHeader && isEditingDisabled && (
                    <Button
                        className={s.newLineHeaderButton}
                        type={ButtonType.SQUARE}
                        disabled={false}
                        onClick={() => this.createNewLineHeaderWithCopy()}
                    >
                        Luo uusi linjan otsikko käyttäen tätä pohjana
                    </Button>
                )}
            </div>
        );
    }
}

export default LineHeaderView;
