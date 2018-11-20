import React from 'react';
import { observer } from 'mobx-react';
import { FaTimes, FaExclamation } from 'react-icons/fa';
import { FiClipboard } from 'react-icons/fi';
import ILogEntry from '~/models/ILogEntry';
import logActions from '~/enums/logActions';
import entityNames from '~/enums/entityNames';
import GeometryLogStore from '../../../stores/geometryLogStore';
import * as s from './eventLog.scss';

interface IEventLogState {
    isOpen: boolean;
    isAlertShown: boolean;
}

interface IEventLogProps {
}

@observer
export default class EventLog extends React.Component<IEventLogProps, IEventLogState> {
    constructor(props: IEventLogProps) {
        super(props);
        this.state = {
            isOpen: false,
            isAlertShown: false,
        };
    }

    private getLogRow = (action: logActions | null, objectId: string, entity: entityNames) => {
        return `- [${action}] ${entity} (${objectId})`;
    }

    private getSummaryAction = (logs: ILogEntry[]) => {
        let action = null;
        if (
            logs.some(ev => ev.action === logActions.ADD) &&
            logs.some(ev => ev.action === logActions.DELETE)
        ) {
            action = null;
        } else if (
            logs.some(ev => ev.action === logActions.ADD)
        ) {
            action = logActions.ADD;
        } else if (
            logs.some(ev => ev.action === logActions.DELETE)
        ) {
            action = logActions.DELETE;
        } else {
            action = logActions.MOVE;
        }
        return action;
    }

    private getLogs = () => {
        const groupedById = GeometryLogStore!.log.reduce(
            (rv, x) => {
                (rv[x.objectId] = rv[x.objectId] || []).push(x);
                return rv;
            },
            {},
        );
        const res : string[] = [];
        Object.entries(groupedById).forEach(([tag, group]: [string, ILogEntry[]]) => {
            const first = group[0];
            res.push(this.getLogRow(
                this.getSummaryAction(group),
                tag,
                first.entity,
            ));
        });

        return res;
    }

    private toggleEventLog = () => {
        this.setState({
            isOpen: !this.state.isOpen,
        });
    }

    private renderEventLog = () => (
        <div className={s.eventLogContainer}>
            <div className={s.flexInnerRow}>
                <div className={s.topic}>
                    TAPAHTUMALOKI
                </div>
                <div
                    onClick={this.toggleEventLog}
                    className={s.closeView}
                >
                    <FaTimes className={s.close}/>
                </div>
            </div>
            <textarea
                className={s.textArea}
                value={this.getLogs()}
                readOnly={true}
            />
        </div>
    )

    private renderEventLogButton = () => (
        <div
            onClick={this.toggleEventLog}
            className={s.eventLogButton}
        >
            <FiClipboard className={s.logIcon} />
            {this.state.isAlertShown &&
                <FaExclamation
                    className={s.alertIcon}
                />
            }
        </div>
    )

    render() {
        return (
            <div className={s.eventLogView}>
                {!this.state.isOpen ?
                    this.renderEventLogButton() :
                    this.renderEventLog()
                }
            </div>
        );
    }
}
