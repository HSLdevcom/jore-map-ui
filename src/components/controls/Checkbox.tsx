import classnames from 'classnames';
import { observer } from 'mobx-react';
import React from 'react';
import * as s from './checkbox.scss';

interface ICheckboxProps {
    disabled?: boolean;
    checked: boolean;
    content: React.ReactNode;
    onClick: (value: any) => void;
}

const Checkbox = observer((props: ICheckboxProps) => {
    const { disabled, checked, content, onClick, ...attr } = props;

    const _onClick = (event: React.MouseEvent<HTMLElement>) => {
        onClick(!checked);
        event.stopPropagation();
        event.preventDefault();
    };

    return (
        <div
            onClick={_onClick}
            className={classnames(s.container, disabled ? s.disabled : undefined)}
            {...attr}
        >
            <div className={s.content}>{content}</div>
            <input type='checkbox' checked={Boolean(checked)} onChange={() => void 0} />
            <span className={s.checkmark} />
        </div>
    );
});

export default Checkbox;
