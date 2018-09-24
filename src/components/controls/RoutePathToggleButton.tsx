import * as React from 'react';
import TransitType from '../../enums/transitType';
import * as s from './routePathToggleButton.scss';

interface IToggleButtonState {
    isChecked: boolean;
}

interface IToggleButtonProps {
    type: TransitType;
    value: boolean;
    color: string;
    onClick(event: any): void;
}

class RoutePathToggleButton extends React.Component<IToggleButtonProps, IToggleButtonState> {
    constructor (props: IToggleButtonProps) {
        super(props);
    }

    private doNothing() {
        // Empty function
        // Needed because input field wants an onChange function if its checked field is changed
    }

    public render(): any {
        const onClick = (event: React.MouseEvent<HTMLElement>) => {
            this.props.onClick(event);
            event.stopPropagation();
            event.preventDefault();
        };

        const style = {
            backgroundColor: this.props.color,
        };

        return (
            <label
                onClick={onClick}
                className={s.toggleButtonView}
            >
                <input
                    type='checkbox'
                    checked={this.props.value}
                    onChange={this.doNothing}
                />
                <div
                    style={style}
                    className={s.slider}
                />
            </label>
        );
    }
}

export default RoutePathToggleButton;
