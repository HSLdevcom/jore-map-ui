import * as React from 'react';
import TransitType from '../../enums/transitType';

interface IToggleButtonProps {
    type: TransitType;
    onClick(event: any): void;
    value: boolean;
}

class ToggleButton extends React.Component<IToggleButtonProps, {}> {
    public render(): any {
        const buttonOnClick = (event: React.MouseEvent<HTMLElement>) => {
            this.props.onClick(event);
            event.stopPropagation();
            event.preventDefault();
        };

        return (
            <label
                onClick={buttonOnClick}
                className={'switch'}
            >
                <input type='checkbox' checked={this.props.value}/>
                <div
                    className={'slider ' + this.props.type}
                />
            </label>
        );
    }
}

export default ToggleButton;
