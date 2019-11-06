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
import { IMassEditLineHeader, LineHeaderMassEditStore } from '~/stores/lineHeaderMassEditStore';
import SidebarHeader from '../SidebarHeader';
import * as s from './lineHeaderTable.scss';

interface ILineHeaderListProps {
    lineHeaderMassEditStore?: LineHeaderMassEditStore;
    lineHeaders: ILineHeader[];
    currentLineHeader?: ILineHeader;
    lineId: string;
}

@inject('lineHeaderMassEditStore')
@observer
class LineHeaderTable extends React.Component<ILineHeaderListProps> {
    constructor(props: ILineHeaderListProps) {
        super(props);
    }
    componentDidUpdate() {
        const lineHeaders = this.props.lineHeaders;
        if (
            lineHeaders &&
            lineHeaders.length > 0 &&
            !this.props.lineHeaderMassEditStore!.massEditLineHeaders
        ) {
            this.props.lineHeaderMassEditStore!.init(this.props.lineHeaders);
        }
    }

    componentWillUnmount() {
        this.props.lineHeaderMassEditStore!.clear();
    }

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

    private onChangeLineHeaderStartDate = (id: number) => (value: Date) => {
        this.props.lineHeaderMassEditStore!.updateLineHeaderStartDate(id, value);
    };
    private onChangeLineHeaderEndDate = (id: number) => (value: Date) => {
        this.props.lineHeaderMassEditStore!.updateLineHeaderEndDate(id, value);
    };

    private renderLineHeaderRows = () => {
        const lineHeaderMassEditStore = this.props.lineHeaderMassEditStore;
        const validationResults = lineHeaderMassEditStore!.validationResults;
        const isEditingDisabled = lineHeaderMassEditStore!.isEditingDisabled;

        return lineHeaderMassEditStore!.massEditLineHeaders!.map(
            (massEditLineHeader: IMassEditLineHeader, index: number) => {
                const lineHeader = massEditLineHeader.lineHeader;
                const isCurrentLineHeader = _.isEqual(this.props.currentLineHeader, lineHeader);
                const validationResult = validationResults
                    ? validationResults[massEditLineHeader.id]
                    : undefined;
                return (
                    <tr
                        key={index}
                        className={classnames(
                            s.lineHeaderTableRow,
                            isCurrentLineHeader ? s.lineHeaderRowHighlight : undefined
                        )}
                    >
                        <td>{lineHeader.lineNameFi}</td>
                        <td className={s.lineHeaderTableCalendarCell}>
                            <InputContainer
                                className={s.timeInput}
                                disabled={isEditingDisabled}
                                label=''
                                type='date'
                                value={lineHeader.startDate}
                                onChange={this.onChangeLineHeaderStartDate(massEditLineHeader.id)}
                                validationResult={validationResult}
                            />
                        </td>
                        <td className={s.lineHeaderTableCalendarCell}>
                            <InputContainer
                                className={s.timeInput}
                                disabled={isEditingDisabled}
                                label=''
                                type='date'
                                value={lineHeader.endDate}
                                onChange={this.onChangeLineHeaderEndDate(massEditLineHeader.id)}
                            />
                        </td>
                        <td className={s.lineHeaderTableButtonCell}>
                            <Button
                                className={s.editLineHeaderButton}
                                hasReverseColor={true}
                                onClick={this.redirectToEditLineHeaderView(
                                    lineHeaderMassEditStore!.getOldLineHeaderStartDate(
                                        massEditLineHeader.id
                                    )
                                )}
                            >
                                <FiInfo />
                            </Button>
                        </td>
                    </tr>
                );
            }
        );
    };

    private saveLineHeaders = () => {
        // TODO: SAVE
        // const massEditLineHeaders = this.props.lineHeaderMassEditStore!.massEditLineHeaders;
        // console.log('massEditLineHeaders ', massEditLineHeaders);
        // CALL lineHeaderService.massUpdateLineHeaders();
        // this.props.saveLineHeaders([]);
    };

    private isFormValid = () => {
        const validationResults = this.props.lineHeaderMassEditStore!.validationResults;
        if (!validationResults) return true;

        for (const property in validationResults) {
            const validationResult = validationResults[property];
            if (!validationResult.isValid) {
                return false;
            }
        }
        return true;
    };

    render() {
        const lineHeaderMassEditStore = this.props.lineHeaderMassEditStore;
        const massEditLineHeaders = lineHeaderMassEditStore!.massEditLineHeaders;
        const isEditingDisabled = lineHeaderMassEditStore!.isEditingDisabled;
        if (!massEditLineHeaders) return null;
        const isSaveButtonDisabled =
            isEditingDisabled || !lineHeaderMassEditStore!.isDirty || !this.isFormValid();
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
                {massEditLineHeaders.length > 0 ? (
                    <table className={s.lineHeaderTable}>
                        <tbody>
                            <tr>
                                <th className={classnames(s.inputLabel, s.columnHeader)}>
                                    LINJAN NIMI
                                </th>
                                <th className={classnames(s.inputLabel, s.columnHeader)}>
                                    VOIM. AST
                                </th>
                                <th className={classnames(s.inputLabel, s.columnHeader)}>
                                    VIIM. VOIM.
                                </th>
                                <th />
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
                        disabled={isSaveButtonDisabled}
                    >
                        Tallenna linjan otsikot
                    </Button>
                </div>
            </div>
        );
    }
}

export default LineHeaderTable;
