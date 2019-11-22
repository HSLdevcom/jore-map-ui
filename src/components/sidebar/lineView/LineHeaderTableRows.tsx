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
import FormValidator from '~/validation/FormValidator';
import * as s from './lineHeaderTableRows.scss';

interface ILineHeaderListProps {
    lineHeaderMassEditStore?: LineHeaderMassEditStore;
    confirmStore?: ConfirmStore;
}

@inject('lineHeaderMassEditStore', 'confirmStore')
@observer
class LineHeaderTableRows extends React.Component<ILineHeaderListProps> {
    private onChangeLineHeaderStartDate = (id: number) => (value: Date) => {
        this.props.lineHeaderMassEditStore!.updateLineHeaderStartDate(id, value);
    };

    private onChangeLineHeaderEndDate = (id: number) => (value: Date) => {
        this.props.lineHeaderMassEditStore!.updateLineHeaderEndDate(id, value);
    };

    private removeLineHeader = (massEditLineHeader: IMassEditLineHeader) => () => {
        const confirmText = `Haluatko varmasti poistaa linjan otsikon ${
            massEditLineHeader.lineHeader.lineNameFi
        }?`;
        this.props.confirmStore!.openConfirm(confirmText, () => {
            this.props.lineHeaderMassEditStore!.removeLineHeader(massEditLineHeader.id);
        });
    };

    private createNewLineHeaderWithCopy = (id?: number) => () => {
        const lineHeaderMassEditStore = this.props.lineHeaderMassEditStore;
        const lineHeaderToCopyId =
            id !== undefined ? id : lineHeaderMassEditStore!.selectedLineHeaderId;
        const selectedLineHeader = lineHeaderMassEditStore!.massEditLineHeaders!.find(
            m => m.id === lineHeaderToCopyId
        )!.lineHeader;
        const newLineHeader = _.cloneDeep(selectedLineHeader);
        newLineHeader.originalStartDate = undefined;
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
                                        : 'Sisältää validaatiovirheitä'
                                }}
                            />
                        </td>
                        <td className={s.lineHeaderTableCalendarCell}>
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
                            />
                        </td>
                        <td className={s.lineHeaderTableCalendarCell}>
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
                            <Button
                                className={classnames(
                                    s.lineHeaderButton,
                                    s.removeLineHeaderButton,
                                    isRemoveLineHeaderButtonDisabled
                                        ? s.disabledRemoveLineHeaderButton
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
                        </td>
                        <td className={s.lineHeaderTableButtonCell}>
                            <Button
                                className={s.lineHeaderButton}
                                hasReverseColor={true}
                                onClick={this.createNewLineHeaderWithCopy(
                                    currentMassEditLineHeader.id
                                )}
                            >
                                <FiCopy />
                            </Button>
                        </td>
                        <td className={s.lineHeaderTableButtonCell}>
                            <Button
                                className={s.lineHeaderButton}
                                hasReverseColor={true}
                                onClick={this.openLineHeaderById(currentMassEditLineHeader.id)}
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
