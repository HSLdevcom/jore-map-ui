import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import React, { ReactNode } from 'react';
import { FiArrowLeft, FiEdit3, FiXCircle } from 'react-icons/fi';
import navigator from '~/routing/navigator';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import { LoginStore } from '~/stores/loginStore';
import * as s from './sidebarHeader.scss';

interface ISidebarHeaderProps {
    children: ReactNode;
    hideCloseButton?: boolean;
    hideBackButton?: boolean;
    isEditButtonVisible?: boolean;
    loginStore?: LoginStore;
    isEditing?: boolean;
    shouldShowClosePromptMessage?: boolean;
    onEditButtonClick?: () => void;
    onBackButtonClick?: () => void;
}

const closePromptMessage =
    'Sinulla on tallentamattomia muutoksia. Oletko varma, että haluat poistua näkymästä? Tallentamattomat muutokset kumotaan.';
const revertPromptMessage =
    'Sinulla on tallentamattomia muutoksia. Oletko varma, että haluat lopettaa muokkaamisen? Tallentamattomat muutokset kumotaan';

@inject('loginStore')
@observer
class SidebarHeader extends React.Component<ISidebarHeaderProps> {
    onBackButtonClick = () => {
        if (!this.props.shouldShowClosePromptMessage || confirm(closePromptMessage)) {
            this.props.onBackButtonClick ? this.props.onBackButtonClick() : navigator.goBack();
        }
    };

    onEditButtonClick = () => {
        if (this.props.isEditing!) {
            if (!this.props.shouldShowClosePromptMessage || confirm(revertPromptMessage)) {
                this.props.onEditButtonClick!();
            }
        } else {
            this.props.onEditButtonClick!();
        }
    };

    onCloseButtonClick = () => {
        const homeLink = routeBuilder
            .to(SubSites.home)
            .clear()
            .toLink();
        navigator.goTo(homeLink);
    };

    render() {
        return (
            <div className={s.sidebarHeaderView}>
                <div className={s.topic}>{this.props.children}</div>
                <div>
                    {this.props.isEditButtonVisible && this.props.loginStore!.hasWriteAccess && (
                        <FiEdit3
                            onClick={this.onEditButtonClick}
                            className={classnames(s.icon, this.props.isEditing && s.active)}
                        />
                    )}
                    {!this.props.hideBackButton && (
                        <FiArrowLeft className={s.icon} onClick={this.onBackButtonClick} />
                    )}
                    {!this.props.hideCloseButton && (
                        <FiXCircle className={s.icon} onClick={this.onCloseButtonClick} />
                    )}
                </div>
            </div>
        );
    }
}
export default SidebarHeader;
