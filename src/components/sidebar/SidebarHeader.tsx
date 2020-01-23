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
    isEditing?: boolean;
    isEditButtonVisible?: boolean;
    isEditPromptHidden?: boolean;
    onEditButtonClick?: () => void;
    isBackButtonVisible?: boolean;
    onBackButtonClick?: () => void;
    isCloseButtonVisible?: boolean;
    closePromptMessage?: string;
    onCloseButtonClick?: () => void;
    loginStore?: LoginStore;
    confirmStore?: ConfirmStore;
    navigationStore?: NavigationStore;
}

const defaultClosePromptMessage =
    'Sinulla on tallentamattomia muutoksia. Oletko varma, että haluat poistua näkymästä? Tallentamattomat muutokset kumotaan.';
const defaultEditPromptMessage =
    'Sinulla on tallentamattomia muutoksia. Oletko varma, että haluat lopettaa muokkaamisen? Tallentamattomat muutokset kumotaan.';

@inject('loginStore', 'confirmStore', 'navigationStore')
@observer
class SidebarHeader extends React.Component<ISidebarHeaderProps> {
    private onEditButtonClick = () => {
        if (this.props.isEditPromptHidden) {
            this.props.onEditButtonClick!();
            return;
        }

        if (this.props.navigationStore!.shouldShowUnsavedChangesPrompt) {
            this.props.confirmStore!.openConfirm({
                content: defaultEditPromptMessage,
                onConfirm: this.props.onEditButtonClick!,
                confirmButtonText: 'Kyllä'
            });
        } else {
            this.props.onEditButtonClick!();
        }
    };

    private onBackButtonClick = () => {
        if (this.props.onBackButtonClick) {
            this.props.onBackButtonClick();
            return;
        }

        const promptMessage = this.props.closePromptMessage
            ? this.props.closePromptMessage
            : defaultClosePromptMessage;
        const defaultOnClick = () => {
            navigator.goBack({ unsavedChangesPromptMessage: promptMessage });
        };
        defaultOnClick();
    };

    private onCloseButtonClick = () => {
        if (this.props.onCloseButtonClick) {
            this.props.onCloseButtonClick();
            return;
        }

        const promptMessage = this.props.closePromptMessage
            ? this.props.closePromptMessage
            : defaultClosePromptMessage;
        const defaultOnClick = () => {
            const homeViewLink = routeBuilder.to(SubSites.home).toLink();
            navigator.goTo({ link: homeViewLink, unsavedChangesPromptMessage: promptMessage });
        };
        defaultOnClick();
    };

    render() {
        return (
            <div className={s.sidebarHeaderView} data-cy='sidebarHeaderView'>
                <div className={s.topic}>{this.props.children}</div>
                <div className={s.buttonContainer}>
                    {this.props.isEditButtonVisible && this.props.loginStore!.hasWriteAccess && (
                        <FiEdit3
                            onClick={this.onEditButtonClick}
                            className={classnames(s.icon, this.props.isEditing && s.active)}
                            data-cy='editButton'
                        />
                    )}
                    {!this.props.isBackButtonVisible && (
                        <FiArrowLeft
                            className={s.icon}
                            onClick={this.onBackButtonClick}
                            data-cy='backButton'
                        />
                    )}
                    {!this.props.isCloseButtonVisible && (
                        <FiXCircle
                            className={s.icon}
                            onClick={this.onCloseButtonClick}
                            data-cy='closeButton'
                        />
                    )}
                </div>
            </div>
        );
    }
}

export default SidebarHeader;
