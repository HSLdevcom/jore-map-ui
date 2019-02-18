import React from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { FaTimes, FaExclamation } from 'react-icons/fa';
import { FiClipboard } from 'react-icons/fi';
import ILogEntry from '~/models/IEvent';
import * as s from './eventLog.scss';

interface IEventLogState {
    isOpen: boolean;
    isAlertShown: boolean;
}

interface IEventLogProps {
}

@observer
class EventLog extends React.Component<IEventLogProps, IEventLogState> {
    scrollRef: React.RefObject<HTMLDivElement>;

    constructor(props: IEventLogProps) {
        super(props);
        this.state = {
            isOpen: false,
            isAlertShown: false,
        };
        this.scrollRef = React.createRef();
    }

    private renderEvents = (entries: ILogEntry[]) => {
        return entries.map((entry, index) => {
            return (
                <div className={s.event} key={index}>
                    <div className={classnames(s.eventType)}>
                        {entry.action}
                    </div>
                </div>
            );
        });
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
            <div className={s.eventLogArea}>
                {
                    this.renderEvents([])
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

export default EventLog;
