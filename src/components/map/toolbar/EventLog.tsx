import React from 'react';
import { observer } from 'mobx-react';
import { FaTimes, FaExclamation } from 'react-icons/fa';
import { FiClipboard } from 'react-icons/fi';
import * as s from './eventLog.scss';

interface IEventLogState {
    isOpen: boolean;
    showAlert: boolean;
}

interface IEventLogProps {
}

@observer
export default class EventLog extends React.Component<IEventLogProps, IEventLogState> {
    constructor(props: any) {
        super(props);
        this.state = {
            isOpen: false,
            showAlert: false,
        };
    }

    private getLogs = () => {
        return 'logs';
    }

    private toggleLog = () => {
        this.setState({
            isOpen: !this.state.isOpen,
        });
    }

    private logView = () => (
        <div className={s.eventLogView}>
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

    private logButtonView = () => (
        <div className={s.eventLogButtonView}>
            <FiClipboard
                onClick={this.toggleLog}
                className={s.logIcon}
            />
            {this.state.showAlert &&
                <FaExclamation
                    className={s.alertIcon}
                />
            }
        </div>
    )

    render() {
        return (
            <div className={s.eventLogContainer}>
                {!this.state.isOpen ?
                    this.logButtonView() :
                    this.logView()
                }
            </div>
        );
    }
}
