import React, { Component } from 'react';
import { IoMdContact } from 'react-icons/io';
import hslLogo from '~/assets/hsl-logo.png';
import routeBuilder from '~/routing/routeBuilder';
import { observer, inject } from 'mobx-react';
import { LoginStore } from '~/stores/loginStore';
import SubSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import AuthService from '~/services/authService';
import ButtonType from '~/enums/buttonType';
import { Button } from './controls/index';
import packageVersion from '../project/version.json';
import * as s from './navigationBar.scss';

interface INavigationBarProps {
    loginStore?: LoginStore;
}

@inject('loginStore')
@observer
class NavigationBar extends Component<INavigationBarProps> {
    private goToHomeView = () => {
        const homeLink = routeBuilder
            .to(SubSites.home)
            .clear()
            .toLink();
        navigator.goTo(homeLink);
    };

    render() {
        const buildDate = process.env.BUILD_DATE;
        const buildDateInfo = buildDate ? `Date: ${buildDate}` : '';

        return (
            <div className={s.navigationBarView}>
                <div className={s.buildInfo}>
                    {`Build: ${packageVersion.version} ${buildDateInfo}`}
                </div>
                <div onClick={this.goToHomeView} className={s.header}>
                    <img className={s.logo} src={hslLogo} alt='HSL Logo' />
                    <div className={s.title}>Joukkoliikennerekisteri</div>
                </div>
                <div className={s.authSection}>
                    <div className={s.authInfo}>
                        <IoMdContact />
                        <div>
                            {this.props.loginStore!.userEmail}
                            <br />
                            {this.props.loginStore!.hasWriteAccess
                                ? 'Pääkäyttäjä'
                                : 'Selauskäyttäjä'}
                        </div>
                    </div>
                    <Button
                        className={s.logoutButton}
                        type={ButtonType.SAVE}
                        onClick={AuthService.logout}
                    >
                        Kirjaudu ulos
                    </Button>
                </div>
            </div>
        );
    }
}

export default NavigationBar;
