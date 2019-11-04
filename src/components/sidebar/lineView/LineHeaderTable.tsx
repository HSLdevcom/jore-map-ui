import classnames from 'classnames';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import Moment from 'moment';
import React from 'react';
import { FiInfo } from 'react-icons/fi';
import { Button } from '~/components/controls';
import InputContainer from '~/components/controls/InputContainer';
import ButtonType from '~/enums/buttonType';
import ILineHeader from '~/models/ILineHeader';
import navigator from '~/routing/navigator';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import { LineHeaderMassEditStore } from '~/stores/lineHeaderMassEditStore';
import SidebarHeader from '../SidebarHeader';
import * as s from './lineHeaderTable.scss';

interface ILineHeaderListProps {
    lineHeaderMassEditStore?: LineHeaderMassEditStore;
    lineHeaders: ILineHeader[];
    currentLineHeader?: ILineHeader;
    lineId: string;
    saveLineHeaders: (lineHeaders: ILineHeader[]) => void;
}

@inject('lineHeaderMassEditStore')
@observer
class LineHeaderTable extends React.Component<ILineHeaderListProps> {
    private redirectToEditLineHeaderView = (startDate: Date) => () => {
        const editLineHeaderLink = routeBuilder
            .to(SubSites.lineHeader)
            .toTarget(':id', this.props.lineId)
            .toTarget(':startDate', Moment(startDate).format())
            .toLink();

        navigator.goTo(editLineHeaderLink);
    };
    private redirectToNewLineHeaderView = () => {
        const newLineHeaderLink = routeBuilder
            .to(SubSites.newLineHeader)
            .toTarget(':id', this.props.lineId)
            .toLink();

        navigator.goTo(newLineHeaderLink);
    };

    private onChangeLineHeaderStartDate = () => {};
    private onChangeLineHeaderEndDate = () => {};

    private renderLineHeaderRows = () => {
        const lineHeaderMassEditStore = this.props.lineHeaderMassEditStore;
        const isEditingDisabled = lineHeaderMassEditStore!.isEditingDisabled;

        return this.props.lineHeaders.map((lineHeader: ILineHeader, index: number) => {
            const isCurrentLineHeader = _.isEqual(this.props.currentLineHeader, lineHeader);
            return (
                <tr
                    key={index}
                    className={isCurrentLineHeader ? s.lineHeaderRowHighlight : undefined}
                >
                    <td>{lineHeader.lineNameFi}</td>
                    <td className={s.timestampRow}>
                        <InputContainer
                            className={s.timeInput}
                            disabled={isEditingDisabled}
                            label=''
                            type='date'
                            value={lineHeader.startDate}
                            onChange={this.onChangeLineHeaderStartDate}
                            validationResult={{ isValid: true }}
                        />
                    </td>
                    <td className={s.timestampRow}>
                        <InputContainer
                            className={s.timeInput}
                            disabled={isEditingDisabled}
                            label=''
                            type='date'
                            value={lineHeader.endDate}
                            onChange={this.onChangeLineHeaderEndDate}
                            validationResult={{ isValid: true }}
                        />
                    </td>

                    <td>
                        <Button
                            className={s.editLineHeaderButton}
                            hasReverseColor={true}
                            onClick={this.redirectToEditLineHeaderView(lineHeader.startDate!)}
                        >
                            <FiInfo />
                        </Button>
                    </td>
                </tr>
            );
        });
    };

    private saveLineHeaders = () => {
        this.props.saveLineHeaders([]);
    };

    render() {
        const lineHeaderMassEditStore = this.props.lineHeaderMassEditStore;
        const isEditingDisabled = lineHeaderMassEditStore!.isEditingDisabled;

        const isSaveLineHeadersButtonDisabled = true;
        return (
            <div className={s.lineHeaderTableView}>
                <SidebarHeader
                    isEditing={!isEditingDisabled}
                    onEditButtonClick={lineHeaderMassEditStore!.toggleIsEditingDisabled}
                    hideCloseButton={true}
                    hideBackButton={true}
                    isEditButtonVisible={true}
                >
                    Linjan otsikot
                </SidebarHeader>
                {this.props.lineHeaders.length > 0 ? (
                    <table className={s.lineHeaderTable}>
                        <tbody>
                            <tr>
                                <th className={classnames(s.inputLabel, s.columnHeader)}>
                                    LINJAN NIMI
                                </th>
                                <th className={classnames(s.inputLabel, s.columnHeader)}>
                                    VOIM. AST.
                                </th>
                                <th className={classnames(s.inputLabel, s.columnHeader)}>
                                    VIIM. VOIM.
                                </th>
                                <th className={s.columnHeader} />
                            </tr>
                            {this.renderLineHeaderRows()}
                        </tbody>
                    </table>
                ) : (
                    <div>Linjalle {this.props.lineId} ei löytynyt otsikoita.</div>
                )}
                <div className={s.buttonContainer}>
                    <Button
                        className={s.createNewLineHeaderButton}
                        type={ButtonType.SQUARE}
                        disabled={false}
                        hasPadding={true}
                        onClick={() => this.redirectToNewLineHeaderView()}
                    >
                        Luo uusi linjan otsikko
                    </Button>
                    <Button
                        className={s.saveLineHeadersButton}
                        onClick={this.saveLineHeaders}
                        type={ButtonType.SAVE}
                        disabled={isSaveLineHeadersButtonDisabled}
                    >
                        Tallenna linjan otsikot
                    </Button>
                </div>
            </div>
        );
    }
}

export default LineHeaderTable;
