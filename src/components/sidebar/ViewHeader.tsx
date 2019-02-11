import React, { ReactNode } from 'react';
import classnames from 'classnames';
import { FiXCircle, FiEdit3 } from 'react-icons/fi';
import navigator from '~/routing/navigator';
import * as s from './viewHeader.scss';

interface IViewHeaderProps {
    children: ReactNode;
    closePromptMessage?: string;
    hideCloseButton?: boolean;
    isEditButtonVisible?: boolean;
    isEditing?: boolean;
    onEditButtonClick?: () => void;
    onCloseButtonClick?: () => void;
}

const viewHeader = (props:IViewHeaderProps) => {
    const onCloseButtonClick = () => {
        if (!props.closePromptMessage || confirm(props.closePromptMessage)) {
            props.onCloseButtonClick ? props.onCloseButtonClick() : navigator.goBack();
        }
    };

    const onEditButtonClick = () => {
        props.onEditButtonClick && props.onEditButtonClick();
    };

    return (
        <div className={s.viewHeaderView}>
            <div className={s.topic}>{props.children}</div>
            <div>
                { props.isEditButtonVisible &&
                    <FiEdit3
                        onClick={onEditButtonClick}
                        className={
                            classnames(
                                s.icon,
                                props.isEditing && s.active,
                            )
                        }
                    />
                }
                { !props.hideCloseButton &&
                    <FiXCircle
                        className={s.icon}
                        onClick={onCloseButtonClick}
                    />
                }
            </div>
        </div>
    );
};
export default viewHeader;
