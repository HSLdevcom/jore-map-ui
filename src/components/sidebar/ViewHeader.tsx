import React, { ReactNode } from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import { FiXCircle, FiEdit3 } from 'react-icons/fi';
import { LoginStore } from '~/stores/loginStore';
import navigator from '~/routing/navigator';
import * as s from './viewHeader.scss';

interface IViewHeaderProps {
    children: ReactNode;
    hideCloseButton?: boolean;
    isEditButtonVisible?: boolean;
    loginStore?: LoginStore;
    isEditing?: boolean;
    shouldShowClosePromptMessage?: boolean;
    onEditButtonClick?: () => void;
    onCloseButtonClick?: () => void;
}

// tslint:disable:max-line-length
const closePromptMessage = 'Sinulla on tallentamattomia muutoksia. Oletko varma, että haluat poistua näkymästä? Tallentamattomat muutokset kumotaan.';
const revertPromptMessage = 'Sinulla on tallentamattomia muutoksia. Oletko varma, että haluat lopettaa muokkaamisen? Tallentamattomat muutokset kumotaan';
// tslint:enable:max-line-length

@inject('loginStore')
@observer
class ViewHeader extends React.Component<IViewHeaderProps> {
    onCloseButtonClick = () => {
        if (!this.props.shouldShowClosePromptMessage || confirm(closePromptMessage)) {
            this.props.onCloseButtonClick ? this.props.onCloseButtonClick() : navigator.goBack();
        }
    }

    onEditButtonClick = () => {
        if (this.props.isEditing!) {
            if (!this.props.shouldShowClosePromptMessage
                || confirm(revertPromptMessage)) {
                this.props.onEditButtonClick!();
            }
        } else {
            this.props.onEditButtonClick!();
        }
    }

    render() {
        return (
            <div className={s.viewHeaderView}>
                <div className={s.topic}>{this.props.children}</div>
                <div>
                    {
                        this.props.isEditButtonVisible &&
                        this.props.loginStore!.hasWriteAccess &&
                        <FiEdit3
                            onClick={this.onEditButtonClick}
                            className={
                                classnames(
                                    s.icon,
                                    this.props.isEditing && s.active,
                                )
                            }
                        />
                    }
                    { !this.props.hideCloseButton &&
                        <FiXCircle
                            className={s.icon}
                            onClick={this.onCloseButtonClick}
                        />
                    }
                </div>
            </div>
        );
    }

}
export default ViewHeader;
