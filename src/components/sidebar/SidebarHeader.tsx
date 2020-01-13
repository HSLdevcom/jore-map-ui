import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import React, { ReactNode } from 'react';
import { FiArrowLeft, FiEdit3, FiXCircle } from 'react-icons/fi';
import navigator from '~/routing/navigator';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import { ConfirmStore } from '~/stores/confirmStore';
import { LoginStore } from '~/stores/loginStore';
import { NavigationStore } from '~/stores/navigationStore';
import * as s from './sidebarHeader.scss';

interface ISidebarHeaderProps {
    children: ReactNode;
    isCloseButtonVisible?: boolean;
    isBackButtonVisible?: boolean;
    isEditButtonVisible?: boolean;
    isEditing?: boolean;
    shouldShowEditButtonClosePromptMessage?: boolean;
    onEditButtonClick?: () => void;
    onBackButtonClick?: () => void;
    onCloseButtonClick?: () => void;
    loginStore?: LoginStore;
    confirmStore?: ConfirmStore;
    navigationStore?: NavigationStore;
}

const closePromptMessage =
    'Sinulla on tallentamattomia muutoksia. Oletko varma, että haluat poistua näkymästä? Tallentamattomat muutokset kumotaan.';
const revertPromptMessage =
    'Sinulla on tallentamattomia muutoksia. Oletko varma, että haluat lopettaa muokkaamisen? Tallentamattomat muutokset kumotaan.';

@inject('loginStore', 'confirmStore', 'navigationStore')
@observer
class SidebarHeader extends React.Component<ISidebarHeaderProps> {
    private onBackButtonClick = () => {
        const defaultOnClick = () => {
            navigator.goBack({ unsavedChangesPromptMessage: closePromptMessage });
        };
        if (this.props.onBackButtonClick) {
            if (this.props.navigationStore!.shouldShowUnsavedChangesPrompt) {
                this.props.confirmStore!.openConfirm({
                    content: closePromptMessage,
                    onConfirm: this.props.onBackButtonClick!,
                    confirmButtonText: 'Kyllä'
                });
            }
        } else {
            defaultOnClick();
        }
    };

    private onCloseButtonClick = () => {
        const defaultOnClick = () => {
            const homeViewLink = routeBuilder.to(SubSites.home).toLink();
            navigator.goTo({ link: homeViewLink, unsavedChangesPromptMessage: closePromptMessage });
        };
        if (this.props.onCloseButtonClick) {
            if (this.props.navigationStore!.shouldShowUnsavedChangesPrompt) {
                this.props.confirmStore!.openConfirm({
                    content: closePromptMessage,
                    onConfirm: this.props.onCloseButtonClick!,
                    confirmButtonText: 'Kyllä'
                });
            }
        } else {
            defaultOnClick();
        }
    };

    private onEditButtonClick = () => {
        if (this.props.navigationStore!.shouldShowUnsavedChangesPrompt) {
            this.props.confirmStore!.openConfirm({
                content: revertPromptMessage,
                onConfirm: this.props.onEditButtonClick!,
                confirmButtonText: 'Kyllä'
            });
        } else {
            this.props.onEditButtonClick!();
        }
    };

    render() {
        return (
            <div className={s.sidebarHeaderView}>
                <div className={s.topic}>{this.props.children}</div>
                <div className={s.buttonContainer}>
                    {this.props.isEditButtonVisible && this.props.loginStore!.hasWriteAccess && (
                        <FiEdit3
                            onClick={this.onEditButtonClick}
                            className={classnames(s.icon, this.props.isEditing && s.active)}
                        />
                    )}
                    {!this.props.isBackButtonVisible && (
                        <FiArrowLeft className={s.icon} onClick={this.onBackButtonClick} />
                    )}
                    {!this.props.isCloseButtonVisible && (
                        <FiXCircle className={s.icon} onClick={this.onCloseButtonClick} />
                    )}
                </div>
            </div>
        );
    }
}

export default SidebarHeader;
