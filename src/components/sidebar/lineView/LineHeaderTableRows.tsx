import classnames from 'classnames';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import { FiCopy, FiInfo } from 'react-icons/fi';
import { Button } from '~/components/controls';
import InputContainer from '~/components/controls/InputContainer';
import { ConfirmStore } from '~/stores/confirmStore';
import { IMassEditLineHeader, LineHeaderMassEditStore } from '~/stores/lineHeaderMassEditStore';
import { LoginStore } from '~/stores/loginStore';
import { toMidnightDate } from '~/utils/dateUtils';
import FormValidator from '~/validation/FormValidator';
import * as s from './lineHeaderTableRows.scss';

interface ILineHeaderListProps {
    lineHeaderMassEditStore?: LineHeaderMassEditStore;
    confirmStore?: ConfirmStore;
    loginStore?: LoginStore;
}

@inject('lineHeaderMassEditStore', 'confirmStore', 'loginStore')
@observer
class LineHeaderTableRows extends React.Component<ILineHeaderListProps> {
    private onChangeLineHeaderStartDate = (id: number) => (value: Date) => {
        this.props.lineHeaderMassEditStore!.updateLineHeaderStartDate(id, value);
    };

    private onChangeLineHeaderEndDate = (id: number) => (value: Date) => {
        this.props.lineHeaderMassEditStore!.updateLineHeaderEndDate(id, value);
    };

    private removeLineHeader = (massEditLineHeader: IMassEditLineHeader) => () => {
        const confirmText = `Haluatko varmasti poistaa linjan otsikon ${massEditLineHeader.lineHeader.lineNameFi}?`;
        this.props.confirmStore!.openConfirm({
            confirmData: confirmText,
            onConfirm: () => {
                this.props.lineHeaderMassEditStore!.removeLineHeader(massEditLineHeader.id);
            },
            confirmButtonText: 'Kyllä',
        });
    };

    private createNewLineHeaderWithCopy = (id?: number) => () => {
        const lineHeaderMassEditStore = this.props.lineHeaderMassEditStore;
        const lineHeaderToCopyId =
            id !== undefined ? id : lineHeaderMassEditStore!.selectedLineHeaderId;
        const selectedLineHeader = lineHeaderMassEditStore!.massEditLineHeaders!.find(
            (m) => m.id === lineHeaderToCopyId
        )!.lineHeader;
        const newLineHeader = _.cloneDeep(selectedLineHeader);
        newLineHeader.originalStartDate = undefined;

        const firstLineHeader = lineHeaderMassEditStore!.getFirstLineHeader();
        const defaultDate = new Date(firstLineHeader!.endDate);
        defaultDate.setDate(defaultDate.getDate() + 1);
        newLineHeader.startDate = toMidnightDate(defaultDate);
        newLineHeader.endDate = toMidnightDate(defaultDate);
        this.props.lineHeaderMassEditStore!.createLineHeader(newLineHeader);
    };

    private openLineHeaderById = (id: number) => () => {
        this.props.lineHeaderMassEditStore!.setSelectedLineHeaderId(id);
    };

    render() {
        const lineHeaderMassEditStore = this.props.lineHeaderMassEditStore;
        const isEditingDisabled = lineHeaderMassEditStore!.isEditingDisabled;
        const massEditLineHeaderCount = lineHeaderMassEditStore!.currentLineHeaders!.length;
        const isRemoveLineHeaderButtonDisabled = isEditingDisabled || massEditLineHeaderCount === 1;

        return lineHeaderMassEditStore!.massEditLineHeaders!.map(
            (currentMassEditLineHeader: IMassEditLineHeader, index: number) => {
                if (currentMassEditLineHeader.isRemoved) return;

                const lineHeader = currentMassEditLineHeader.lineHeader;
                const isSelectedLineHeader =
                    lineHeaderMassEditStore!.selectedLineHeaderId === currentMassEditLineHeader.id;
                const invalidPropertiesMap = currentMassEditLineHeader.invalidPropertiesMap;
                const isLineHeaderValid = FormValidator.isInvalidPropertiesMapValid(
                    currentMassEditLineHeader.invalidPropertiesMap
                );
                return (
                    <tr
                        key={index}
                        className={classnames(
                            s.lineHeaderTableRow,
                            isSelectedLineHeader ? s.lineHeaderRowHighlight : undefined
                        )}
                    >
                        <td className={s.lineHeaderTableNameCell}>
                            <InputContainer
                                disabled={true}
                                label=''
                                value={lineHeader.lineNameFi}
                                validationResult={{
                                    isValid: isLineHeaderValid,
                                    errorMessage: isLineHeaderValid
                                        ? ''
                                        : 'Sisältää validaatiovirheitä',
                                }}
                            />
                        </td>
                        <td
                            className={classnames(
                                s.lineHeaderTableCalendarCell,
                                !isEditingDisabled ? s.editedCalendarCell : undefined
                            )}
                        >
                            <InputContainer
                                className={s.timeInput}
                                disabled={isEditingDisabled}
                                label=''
                                type='date'
                                value={lineHeader.startDate}
                                onChange={this.onChangeLineHeaderStartDate(
                                    currentMassEditLineHeader.id
                                )}
                                validationResult={invalidPropertiesMap['startDate']}
                                onFocus={this.openLineHeaderById(currentMassEditLineHeader.id)}
                            />
                        </td>
                        <td
                            className={classnames(
                                s.lineHeaderTableCalendarCell,
                                !isEditingDisabled ? s.editedCalendarCell : undefined
                            )}
                        >
                            <InputContainer
                                className={s.timeInput}
                                disabled={isEditingDisabled}
                                label=''
                                type='date'
                                value={lineHeader.endDate}
                                onChange={this.onChangeLineHeaderEndDate(
                                    currentMassEditLineHeader.id
                                )}
                            />
                        </td>
                        <td className={s.lineHeaderTableButtonCell}>
                            {this.props.loginStore!.hasWriteAccess && (
                                <Button
                                    className={classnames(
                                        s.lineHeaderButton,
                                        s.removeLineHeaderButton,
                                        isRemoveLineHeaderButtonDisabled
                                            ? s.disabledLineHeaderButton
                                            : undefined,
                                        isRemoveLineHeaderButtonDisabled && isSelectedLineHeader
                                            ? s.highlightedBackground
                                            : undefined
                                    )}
                                    hasReverseColor={true}
                                    onClick={this.removeLineHeader(currentMassEditLineHeader)}
                                    disabled={isRemoveLineHeaderButtonDisabled}
                                    hasNoTransition={true}
                                >
                                    <FaTrashAlt />
                                </Button>
                            )}
                        </td>
                        <td className={s.lineHeaderTableButtonCell}>
                            {this.props.loginStore!.hasWriteAccess && (
                                <Button
                                    className={classnames(
                                        s.lineHeaderButton,
                                        isEditingDisabled ? s.disabledLineHeaderButton : undefined,
                                        isEditingDisabled && isSelectedLineHeader
                                            ? s.highlightedBackground
                                            : undefined
                                    )}
                                    hasReverseColor={true}
                                    onClick={this.createNewLineHeaderWithCopy(
                                        currentMassEditLineHeader.id
                                    )}
                                    disabled={isEditingDisabled}
                                    hasNoTransition={true}
                                >
                                    <FiCopy />
                                </Button>
                            )}
                        </td>
                        <td className={s.lineHeaderTableButtonCell}>
                            <Button
                                className={s.lineHeaderButton}
                                hasReverseColor={true}
                                onClick={this.openLineHeaderById(currentMassEditLineHeader.id)}
                                data-cy='lineHeaderButton'
                            >
                                <FiInfo />
                            </Button>
                        </td>
                    </tr>
                );
            }
        );
    }
}

export default LineHeaderTableRows;
