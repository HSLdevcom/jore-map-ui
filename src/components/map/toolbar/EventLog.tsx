import React from 'react';
import { observer } from 'mobx-react';
import { FaTimes, FaExclamation } from 'react-icons/fa';
import { FiClipboard } from 'react-icons/fi';
import * as s from './eventLog.scss';

interface IEventLogState {
    isOpen: boolean;
    isAlertShown: boolean;
}

interface IEventLogProps {
}

@observer
export default class EventLog extends React.Component<IEventLogProps, IEventLogState> {
    constructor(props: any) {
        super(props);
        this.state = {
            isOpen: false,
            isAlertShown: false,
        };
    }

    private getLogs = () => {
        return 'logs';
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
