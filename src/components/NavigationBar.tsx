import React, { Component } from 'react';
import hslLogo from '~/assets/hsl-logo.png';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import packageVersion from '../project/version.json';
import * as s from './navigationBar.scss';

class NavigationBar extends Component {
    private goToHomeView = () => {
        const homeLink = routeBuilder.to(SubSites.home).clear().toLink();
        navigator.goTo(homeLink);
    }

    render () {
        const buildDate = process.env.BUILD_DATE;
        const buildDateInfo = buildDate ? `Date: ${buildDate}` : '';

        return (
            <div className={s.navigationBarView}>
                <div className={s.buildInfo}>
                    {`Build: ${packageVersion.version} ${buildDateInfo}`}
                </div>
                <div onClick={this.goToHomeView} className={s.header}>
                    <img className={s.logo} src={hslLogo} alt='HSL Logo'/>
                    <p className={s.title}>
                        Joukkoliikennerekisteri
                    </p>
                </div>
            </div>
        );
    }
}

export default NavigationBar;
