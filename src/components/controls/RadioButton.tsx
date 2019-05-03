import React from 'react';
import { observer } from 'mobx-react';
import * as s from './radioButton.scss';

interface IRadioButtonProps {
    checked: boolean;
    text: string;
    onClick(event: any): void;
}

const RadioButton = observer((props: IRadioButtonProps) => {
    const doNothing = () => {};

    const onClick = (event: React.MouseEvent<HTMLElement>) => {
        props.onClick(event);
        event.stopPropagation();
        event.preventDefault();
    };

    return (
        <label onClick={onClick} className={s.container}>
            {props.text}
            <input type='radio' checked={props.checked} onChange={doNothing} />
            <span className={s.checkmark} />
        </label>
    );
});

export default RadioButton;
