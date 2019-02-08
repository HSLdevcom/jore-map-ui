import React, { Component } from 'react';
import { ErrorStore } from '~/stores/errorStore';
import { observer, inject } from 'mobx-react';
import { IoMdClose } from 'react-icons/io';
import * as s from './errorBar.scss';

interface IErrorBarProps {
    errorStore?: ErrorStore;
}

@inject('errorStore')
@observer
class ErrorBar extends Component<IErrorBarProps> {
    private popError = () => {
        this.props.errorStore!.pop();
    }

    render() {
        if (!this.props.errorStore!.latestError) {
            return null;
        }

        return (
            <div className={s.errorBarView}>
                {this.props.errorStore!.latestError}
                {this.props.errorStore!.errorCount > 1 &&
                    (
                        ` (${this.props.errorStore!.errorCount})`
                    )
                }
                <IoMdClose onClick={this.popError}/>
            </div>
        );
    }
}
export default ErrorBar;
