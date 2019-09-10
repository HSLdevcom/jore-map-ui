import React from 'react';
import Moment from 'moment';
import _ from 'lodash';
import classnames from 'classnames';
import { FiInfo } from 'react-icons/fi';
import ButtonType from '~/enums/buttonType';
import ILineHeader from '~/models/ILineHeader';
import SubSites from '~/routing/subSites';
import routeBuilder from '~/routing/routeBuilder';
import navigator from '~/routing/navigator';
import { Button } from '~/components/controls';
import SidebarHeader from '../SidebarHeader';
import * as s from './lineHeaderTable.scss';

interface ILineHeaderListProps {
    lineHeaders: ILineHeader[];
    currentLineHeader?: ILineHeader;
    lineId: string;
}

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
    render() {
        return (
            <div className={s.lineHeaderTableView}>
                <SidebarHeader hideCloseButton={true}>
                    Linjan otsikot
                </SidebarHeader>
                {this.props.lineHeaders.length > 0 ? (
                    <table className={s.lineHeaderTable}>
                        <tbody>
                            <tr>
                                <th
                                    className={classnames(
                                        s.inputLabel,
                                        s.columnHeader
                                    )}
                                >
                                    LINJAN NIMI
                                </th>
                                <th
                                    className={classnames(
                                        s.inputLabel,
                                        s.columnHeader
                                    )}
                                >
                                    VOIM. AST.
                                </th>
                                <th
                                    className={classnames(
                                        s.inputLabel,
                                        s.columnHeader
                                    )}
                                >
                                    VIIM. VOIM.
                                </th>
                                <th className={s.columnHeader} />
                            </tr>
                            {this.props.lineHeaders.map(
                                (lineHeader: ILineHeader, index: number) => {
                                    const isCurrentLineHeader = _.isEqual(
                                        this.props.currentLineHeader,
                                        lineHeader
                                    );
                                    return (
                                        <tr
                                            key={index}
                                            className={
                                                isCurrentLineHeader
                                                    ? s.lineHeaderRowHighlight
                                                    : undefined
                                            }
                                        >
                                            <td>{lineHeader.lineNameFi}</td>
                                            <td className={s.timestampRow}>
                                                {Moment(
                                                    lineHeader.startDate
                                                ).format('DD-MM-YYYY')}
                                            </td>
                                            <td className={s.timestampRow}>
                                                {Moment(
                                                    lineHeader.endDate
                                                ).format('DD-MM-YYYY')}
                                            </td>
                                            <td>
                                                <Button
                                                    className={
                                                        s.editLineHeaderButton
                                                    }
                                                    hasReverseColor={true}
                                                    onClick={this.redirectToEditLineHeaderView(
                                                        lineHeader.startDate!
                                                    )}
                                                >
                                                    <FiInfo />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                }
                            )}
                        </tbody>
                    </table>
                ) : (
                    <div>
                        Linjalle {this.props.lineId} ei löytynyt otsikoita.
                    </div>
                )}
                <Button
                    className={s.newLineHeaderButton}
                    type={ButtonType.SQUARE}
                    disabled={false}
                    onClick={() => this.redirectToNewLineHeaderView()}
                >
                    Luo uusi linjan otsikko
                </Button>
            </div>
        );
    }
}

export default LineHeaderTable;