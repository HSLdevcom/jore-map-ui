import React from 'react';
import Moment from 'moment';
import _ from 'lodash';
import classnames from 'classnames';
import { FiInfo } from 'react-icons/fi';
import ButtonType from '~/enums/buttonType';
import { ILineTopic } from '~/services/lineTopicService';
import { Button } from '~/components/controls';
import SidebarHeader from '../SidebarHeader';
import * as s from './lineTopicTable.scss';

interface ILineTopicListProps {
    lineTopics: ILineTopic[];
    currentLineTopic?: ILineTopic;
    lineId: string;
}

class LineTopicTable extends React.Component<ILineTopicListProps> {
    private redirectToEditLineTopicView = () => {
        // TODO
        window.alert('Toiminnon suunnittelu kesken.');
    };
    private redirectToNewLineTopicView = () => {
        // TODO
        window.alert('Toiminnon suunnittelu kesken.');
    };
    render() {
        return (
            <div className={s.lineTopicTableView}>
                <SidebarHeader hideCloseButton={true}>
                    Linjan otsikot
                </SidebarHeader>
                {this.props.lineTopics.length > 0 ? (
                    <table className={s.lineTopicTable}>
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
                            {this.props.lineTopics.map(
                                (lineTopic: ILineTopic, index: number) => {
                                    const isCurrentLineTopic = _.isEqual(
                                        this.props.currentLineTopic,
                                        lineTopic
                                    );
                                    return (
                                        <tr
                                            key={index}
                                            className={
                                                isCurrentLineTopic
                                                    ? s.lineTopicRowHighlight
                                                    : undefined
                                            }
                                        >
                                            <td>{lineTopic.lineName}</td>
                                            <td className={s.timestampRow}>
                                                {Moment(
                                                    lineTopic.lineStartTime
                                                ).format('DD-MM-YYYY')}
                                            </td>
                                            <td className={s.timestampRow}>
                                                {Moment(
                                                    lineTopic.lineEndTime
                                                ).format('DD-MM-YYYY')}
                                            </td>
                                            <td>
                                                <Button
                                                    type={ButtonType.HOVER}
                                                    onClick={
                                                        this
                                                            .redirectToEditLineTopicView
                                                    }
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
                    className={s.newLineTopicButton}
                    type={ButtonType.SQUARE}
                    disabled={false}
                    onClick={() => this.redirectToNewLineTopicView()}
                >
                    Luo uusi linjan otsikko
                </Button>
            </div>
        );
    }
}

export default LineTopicTable;
