import React from 'react';
import classnames from 'classnames';
import * as s from './toggleView.scss';

interface IToggleViewProps {
    children: JSX.Element[];
}

const ToggleView = (props: IToggleViewProps) => {
    return (
        <div className={s.toggleView}>
            <div className={s.buttonContainer}>
                {props.children}
            </div>
        </div>
    );
};

interface IToggleItemProps {
    icon?: JSX.Element;
    text: string;
    isActive: boolean;
    onClick(): void;
}

export const ToggleItem = (props: IToggleItemProps) => {
    return (
        <div
            className={s.buttonContainer}
        >
            <div
                className={classnames(
                    s.button,
                    props.isActive ? s.active : null,
                )}
                onClick={props.onClick}
            >
                {props.icon}
                <div>
                    {props.text}
                </div>
            </div>
        </div>
    );
};

export default ToggleView;
