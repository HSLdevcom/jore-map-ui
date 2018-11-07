import React from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { FaTimes, FaExclamation } from 'react-icons/fa';
import { FiClipboard } from 'react-icons/fi';
import * as s from './geometryLog.scss';

interface IGeometryLogState {
    isToggled: boolean;
    showAlert: boolean;
}

interface IGeometryLogProps {
}

@observer
export default class GeometryLog extends React.Component<IGeometryLogProps, IGeometryLogState> {
    constructor(props: any) {
        super(props);
        this.state = {
            isToggled: false,
            showAlert: false,
        };
    }

    private getLogs = () => {
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
            <div className={s.flexRow}>
                <div
                    className={classnames(
                        s.geometryLogView,
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
