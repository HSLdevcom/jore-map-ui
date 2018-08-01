import * as React from 'react';
import TransitType from '../../enums/transitType';

interface IToggleButtonProps {
    type: TransitType;
    onClick(event: any): void;
}

class ToggleButton extends React.Component<IToggleButtonProps, {}> {
    public render(): any {
        return (
            <label
                onClick={this.props.onClick}
                className={'switch'}
            >
                <input type='checkbox' />
                <div
                    className={'slider ' + this.props.type}
                />
            </label>
        );
    }
}

export default ToggleButton;
