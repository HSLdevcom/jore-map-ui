import React from 'react';
import { observer } from 'mobx-react';
import * as s from './checkbox.scss';

interface ICheckboxProps {
    checked: boolean;
    text: React.ReactNode;
    onClick(): void;
}

const Checkbox = observer((props: ICheckboxProps) => {
    const doNothing = () => {};

    const onClick = (event: React.MouseEvent<HTMLElement>) => {
        props.onClick();
        event.stopPropagation();
        event.preventDefault();
    };

    return (
        <label
            onClick={onClick}
            className={s.container}
        >
            {props.text}
            <input
                type='checkbox'
                checked={props.checked}
                onChange={doNothing}
            />
            <span className={s.checkmark} />
        </label>
    );
});

export default Checkbox;
