import React from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { FaTimes, FaExclamation } from 'react-icons/fa';
import { FiClipboard } from 'react-icons/fi';
import * as s from './eventLog.scss';

interface IEventLogState {
    isToggled: boolean;
    showAlert: boolean;
}

interface IEventLogProps {
}

@observer
export default class EventLog extends React.Component<IEventLogProps, IEventLogState> {
    constructor(props: any) {
        super(props);
        this.state = {
            isToggled: false,
            showAlert: false,
        };
    }

    private getLogs = () => {
        // TODO Get all logs from store and show them in the window.
        // Show alert based on unread logs. Implement logic when IEventLogs are
        // marked as read.
        return 'logs';
    }

    private toggleLog = () => {
        this.setState({
            isToggled: !this.state.isToggled,
        });
    }

    private logView = () => (
        <div className={s.flexInnerColumn}>
            <div className={s.flexInnerRow}>
                <div className={s.topic}>
                    TAPAHTUMALOKI
                </div>
                <div
                    onClick={this.toggleLog}
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

    render() {
        return (
            <div className={s.flexInnerRow}>
                <div
                    className={classnames(
                        s.eventLogContainer,
                        this.state.isToggled ? s.toggled : '',
                    )}
                >
                    {(this.state.isToggled) ?
                            this.logView() :
                            <FiClipboard
                                onClick={this.toggleLog}
                                className={s.logIcon}
                            />
                    }
                    {this.state.showAlert && !this.state.isToggled &&
                        <FaExclamation
                            className={s.alertIcon}
                        />
                    }
                </div>
            </div>
        );
    }
}
