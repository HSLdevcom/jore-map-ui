import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { IoMdContact, IoMdRefresh } from 'react-icons/io';
import hslLogo from '~/assets/hsl-logo.png';
import constants from '~/constants/constants';
import ButtonType from '~/enums/buttonType';
import endpoints from '~/enums/endpoints';
import navigator from '~/routing/navigator';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import AuthService from '~/services/authService';
import { AlertStore } from '~/stores/alertStore.js';
import { LoginStore } from '~/stores/loginStore';
import ApiClient from '~/util/ApiClient';
import packageVersion from '../project/version.json';
import { Button } from './controls/index';
import * as s from './navigationBar.scss';
import Loader, { LoaderSize } from './shared/loader/Loader';

interface INavigationBarProps {
    alertStore?: AlertStore;
    loginStore?: LoginStore;
}

interface INavigationBarState {
    isSyncLoading?: boolean;
    isDbSyncing?: boolean;
}

@inject('alertStore', 'loginStore')
@observer
class NavigationBar extends Component<INavigationBarProps, INavigationBarState> {
    constructor(props: INavigationBarProps) {
        super(props);
        this.state = {
            isSyncLoading: false
        };
    }

    private goToHomeView = () => {
        const homeLink = routeBuilder
            .to(SubSites.home)
            .clear()
            .toLink();
        navigator.goTo(homeLink);
    };

    private syncLocalDatabase = async () => {
        this.setState({
            isSyncLoading: true
        });
        const response = await ApiClient.postRequest(endpoints.SYNC_LOCAL_DB, {});
        if (response && response.isDbSyncing) {
            this.props.alertStore!.setFadeMessage(
                'Sisäisen JORE-tietokannan synkkaus on jo käynnissä.'
            );
        }
        this.setState({
            isSyncLoading: false
        });
    };

    render() {
        const buildDate = constants.BUILD_DATE;
        const buildDateInfo = buildDate ? `Date: ${buildDate}` : '';
        const isSyncLoading = this.state.isSyncLoading;

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
                    {this.props.loginStore!.hasWriteAccess && (
                        <>
                            {isSyncLoading ? (
                                <div className={s.syncTextWrapper}>
                                    <Loader size={LoaderSize.TINY} />
                                    <div className={s.syncText}>
                                        Synkronoidaan sisäistä JORE-tietokantaa...
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className={s.refreshIconWrapper}
                                    title={
                                        'Synkronoi sisäinen JORE-tietokanta. Käytetään, jos vanhalla käyttöliittymällä on tehty muutoksia ja ne halutaan näkyviin tähän (uuteen) käyttöliittymään.'
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
                    <IoMdContact className={s.navigationBarIcon} />
                    <div className={s.authInfo}>
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
