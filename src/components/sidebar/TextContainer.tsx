import React from 'react';
import moment from 'moment';
import * as s from './inputContainer.scss';

interface IInputProps {
    label: string|JSX.Element;
    value?: string|number|undefined|null|Date;
}

class TextContainer extends React.Component<IInputProps> {
    render() {
        return (
            <div className={s.formItem}>
                <div className={s.inputLabel}>
                    {this.props.label}
                </div>
                {
                    this.props.value instanceof Date ?
                        moment(this.props.value!).format('DD.MM.YYYY') :
                        this.props.value ?
                            this.props.value : ''
                }
            </div>
        );
    }
}

export default TextContainer;
