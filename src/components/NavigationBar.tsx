import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { IoMdContact, IoMdRefresh } from 'react-icons/io';
import hslLogo from '~/assets/hsl-logo.png';
import constants from '~/constants/constants';
import EndpointPath from '~/enums/endpointPath';
import Environment from '~/enums/environment';
import TransitType from '~/enums/transitType';
import LoginIcon from '~/icons/icon-login';
import navigator from '~/routing/navigator';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import AuthService from '~/services/authService';
import { AlertStore } from '~/stores/alertStore';
import { LoginStore } from '~/stores/loginStore';
import { UserStore } from '~/stores/userStore';
import ApiClient from '~/util/ApiClient';
import packageVersion from '../project/version.json';
import * as s from './navigationBar.scss';
import TransitIcon from './shared/TransitIcon';
import Loader from './shared/loader/Loader';

interface INavigationBarProps {
    alertStore?: AlertStore;
    loginStore?: LoginStore;
    userStore?: UserStore;
}

interface INavigationBarState {
    isSyncLoading?: boolean;
    isDbSyncing?: boolean;
}

@inject('alertStore', 'loginStore', 'userStore')
@observer
class NavigationBar extends Component<INavigationBarProps, INavigationBarState> {
    constructor(props: INavigationBarProps) {
        super(props);
        this.state = {
            isSyncLoading: false
        };
    }

    private goToHomeView = () => {
        const homeViewLink = routeBuilder.to(SubSites.home).toLink();
        navigator.goTo({ link: homeViewLink });
    };

    private syncLocalDatabase = async () => {
        this.setState({
            isSyncLoading: true
        });
        const response = await ApiClient.postRequest(EndpointPath.SYNC_LOCAL_DB, {});
        if (response && response.isDbSyncing) {
            this.props.alertStore!.setFadeMessage({
                message: 'Sisäisen JORE-tietokannan päivitys on jo käynnissä.'
            });
        }
        this.setState({
            isSyncLoading: false
        });
    };

    private toggleUserType = () => {
        const currentUserType = this.props.userStore!.userTransitType;
        this.props.userStore!.setUserTransitType(
            currentUserType === TransitType.BUS ? TransitType.TRAM : TransitType.BUS
        );
    };

    render() {
        const buildDate = constants.BUILD_DATE;
        const buildDateInfo = buildDate ? `Date: ${buildDate}` : '';
        const isSyncLoading = this.state.isSyncLoading;
        const isProductionEnvironment = constants.ENVIRONMENT === Environment.PROD;

        return (
            <div className={s.navigationBarView}>
                <div className={s.buildInfo}>
                    {`Build: ${packageVersion.version} ${buildDateInfo}`}
                </div>
                <div className={s.leftContentWrapper}>
                    <div onClick={this.goToHomeView} className={s.header}>
                        <img className={s.logo} src={hslLogo} alt='HSL Logo' />
                        <div className={s.title}>Joukkoliikennerekisteri</div>
                    </div>
                    {!isProductionEnvironment && (
                        <div className={s.testEnvironmentNotification}>| testiympäristö</div>
                    )}
                    {this.props.loginStore!.hasWriteAccess && (
                        <>
                            {isSyncLoading ? (
                                <div className={s.syncTextWrapper}>
                                    <Loader
                                        size='tiny'
                                        containerClassName={s.syncTextLoader}
                                        hasNoMargin={true}
                                    />
                                    <div className={s.syncText}>
                                        Sisäistä JORE-tietokantaa päivitetään...
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className={s.refreshIconWrapper}
                                    title={
                                        'Päivitä sisäinen JORE-tietokanta. Käytä, jos vanhalla käyttöliittymällä on tehty muutoksia eivätkä ne näy tässä uudessa käyttöliittymässä.'
                                    }
                                >
                                    <IoMdRefresh
                                        className={classnames(s.navigationBarIcon, s.refreshIcon)}
                                        onClick={this.syncLocalDatabase}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
                <div className={s.rightContentWrapper}>
                    <div
                        className={s.navigationBarIcon}
                        onClick={this.toggleUserType}
                        title={'Vaihda käyttäjäkohtaisia preferenssejä'}
                    >
                        <TransitIcon
                            transitType={this.props.userStore!.userTransitType}
                            isWithoutBox={true}
                        />
                    </div>
                    |
                    <IoMdContact className={classnames(s.navigationBarIcon, s.contactIcon)} />
                    <div className={s.authInfo} data-cy='authInfo'>
                        <div>
                            {this.props.loginStore!.userEmail}
                            <br />
                            {this.props.loginStore!.hasWriteAccess
                                ? 'Pääkäyttäjä'
                                : 'Selauskäyttäjä'}
                        </div>
                    </div>
                    <div
                        className={s.logoutButton}
                        onClick={AuthService.logout}
                        title='Kirjaudu ulos'
                        data-cy='logoutButton'
                    >
                        <LoginIcon height='24' fill='white' />
                    </div>
                </div>
            </div>
        );
    }
}

export default NavigationBar;
