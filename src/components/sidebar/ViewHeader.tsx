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
    shouldShowClosePromptMessage?: boolean;
    onEditButtonClick?: () => void;
    onCloseButtonClick?: () => void;
}

const ViewHeader = (props:IViewHeaderProps) => {
    // tslint:disable:max-line-length
    const closePromptMessage = 'Sinulla on tallentamattomia muutoksia. Oletko varma, että haluat poistua näkymästä? Tallentamattomat muutokset kumotaan.';
    const revertPromptMessage = 'Sinulla on tallentamattomia muutoksia. Oletko varma, että haluat lopettaa muokkaamisen? Tallentamattomat muutokset kumotaan';
    // tslint:enable:max-line-length

    const onCloseButtonClick = () => {
        if (!props.shouldShowClosePromptMessage || confirm(closePromptMessage)) {
            props.onCloseButtonClick ? props.onCloseButtonClick() : navigator.goBack();
        }
    };

    const onEditButtonClick = () => {
        if (props.isEditing!) {
            if (!props.shouldShowClosePromptMessage || confirm(revertPromptMessage)) {
                props.onEditButtonClick!();
            }
        } else {
            props.onEditButtonClick!();
        }
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
export default ViewHeader;
