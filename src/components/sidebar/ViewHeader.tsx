import React, { ReactNode } from 'react';
import { FaTimes } from 'react-icons/fa';
import navigator from '~/routing/navigator';
import * as s from './viewHeader.scss';

interface IViewHeaderProps {
    children: ReactNode;
    closePromptMessage?: string;
    hideCloseButton?: boolean;
}

const viewHeader = (props:IViewHeaderProps) => {
    const closeSidebarView = () => {
        if (!props.closePromptMessage || confirm(props.closePromptMessage)) {
            navigator.goBack();
        }
    };
    return (
        <div className={s.viewHeaderView}>
            <div className={s.topic}>{props.children}</div>
            { !props.hideCloseButton &&
                <FaTimes
                    className={s.closeButton}
                    onClick={closeSidebarView}
                />
            }
        </div>
    );
};
export default viewHeader;
