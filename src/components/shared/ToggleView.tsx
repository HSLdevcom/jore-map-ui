import classnames from 'classnames';
import { observer } from 'mobx-react';
import React from 'react';
import * as s from './toggleView.scss';

interface IToggleViewProps {
    children: JSX.Element[];
}

const ToggleView = observer((props: IToggleViewProps) => {
    return (
        <div className={s.toggleView}>
            <div className={s.buttonContainer}>{props.children}</div>
        </div>
    );
});

interface IToggleItemProps {
    icon?: JSX.Element;
    text: string;
    isActive: boolean;
    onClick(): void;
}

export const ToggleItem = observer((props: IToggleItemProps) => {
    const { icon, text, isActive, onClick, ...attr } = props;
    return (
        <div className={s.buttonContainer} {...attr}>
            <div
                className={classnames(s.button, props.isActive ? s.active : null)}
                onClick={props.onClick}
            >
                {props.icon}
                <div>{props.text}</div>
            </div>
        </div>
    );
});

export default ToggleView;
