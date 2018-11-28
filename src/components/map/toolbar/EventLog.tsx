import React from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { FaTimes, FaExclamation, FaUndo } from 'react-icons/fa';
import { FiClipboard } from 'react-icons/fi';
import ILogEntry from '~/models/IEvent';
import logActions from '~/enums/eventTypes';
import entityNames from '~/enums/entityNames';
import GeometryEventStore from '../../../stores/geometryEventStore';
import * as s from './eventLog.scss';

interface IEventLogState {
    isOpen: boolean;
    isAlertShown: boolean;
}

interface IEventLogProps {
}

@observer
export default class EventLog extends React.Component<IEventLogProps, IEventLogState> {
    scrollRef: React.RefObject<HTMLDivElement>;

    constructor(props: IEventLogProps) {
        super(props);
        this.state = {
            isOpen: false,
            isAlertShown: false,
        };
        this.scrollRef = React.createRef();
    }

    private renderLogRow = (action: logActions | null, objectId: string, entity: entityNames) => {
        let logActionClass = '';
        switch (action) {
        case logActions.ADD:
            logActionClass = s.logActionAdd;
            break;
        // Uncomment when we have use case for edit and deletion
        //
        // case logActions.DELETE:
        //     logActionClass = s.logActionDelete;
        //     break;
        // case logActions.MOVE:
        //     logActionClass = s.logActionMove;
        //     break;
        }

        return (
            <div className={s.logRow} key={objectId}>
                <div className={classnames(s.logAction, logActionClass)}>
                    {action}
                </div>
                <div className={s.logActionContent}>
                    {entity}
                </div>
                <div className={s.logActionButtons}>
                    <FaUndo />
                </div>
            </div>
        );
    }

    private getSummaryAction = (logs: ILogEntry[]) => {
        let action = null;
        // Uncomment when we have use cases for logging edits and deletion
        //
        // if (
        //     logs.some(ev => ev.action === logActions.ADD) &&
        //     logs.some(ev => ev.action === logActions.DELETE)
        // ) {
        //     action = null;
        // } else
        if (
            logs.some(ev => ev.action === logActions.ADD)
        ) {
            action = logActions.ADD;
        }
        // else if (
        //     logs.some(ev => ev.action === logActions.DELETE)
        // ) {
        //     action = logActions.DELETE;
        // } else {
        //     action = logActions.MOVE;
        // }
        return action;
    }

    private renderEventList = () => {
        const groupedById = GeometryEventStore!.events.reduce(
            (rv, x) => {
                (rv[x.objectId] = rv[x.objectId] || []).push(x);
                return rv;
            },
            {},
        );
        const res : JSX.Element[] = [];
        Object.entries(groupedById).forEach(([id, groupedLogs]: [string, ILogEntry[]]) => {
            const first = groupedLogs[0];
            res.push(this.renderLogRow(
                this.getSummaryAction(groupedLogs),
                id,
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

    private scrollToBottom = () => {
        if (this.scrollRef.current) {
            this.scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }

    componentDidMount() {
        this.scrollToBottom();
    }

    componentDidUpdate() {
        this.scrollToBottom();
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
            <div className={s.logArea}>
                {
                    this.renderEventList()
                }
                <div ref={this.scrollRef} />
            </div>
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
