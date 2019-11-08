import React, { Component } from 'react';
import navigator from '~/routing/navigator';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import * as s from './pageNotFound.scss';

export default class PageNotFound extends Component {
    private goToHomeView = () => {
        const homeLink = routeBuilder
            .to(SubSites.home)
            .clear()
            .toLink();
        navigator.goTo(homeLink);
    };

    render() {
        return (
            <div className={s.pageNotFoundView}>
                <div className={s.content}>
                    Sivua ei löytynyt. Siirry{' '}
                    <span className={s.link} onClick={this.goToHomeView}>
                        kotisivulle
                    </span>
                    .
                </div>
            </div>
        );
    }
}
