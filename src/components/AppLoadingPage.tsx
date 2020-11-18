import { inject, observer } from 'mobx-react';
import React from 'react';
import * as s from './appLoadingPage.scss';

type AppState = 'isLoading' | 'hasBackendConnectionError' | 'isLoggingIn';
interface IAppLoadingPageProps {
    state: AppState;
}
const AppLoadingPage = inject()(
    observer((props: IAppLoadingPageProps) => {
        const renderText = (state: AppState) => {
            switch (state) {
                case 'isLoading':
                    return 'Ladataan sovellusta...';
                case 'isLoggingIn':
                    return 'Kirjaudutaan sisään...';
                case 'hasBackendConnectionError':
                    return 'Taustajärjestelmään ei saatu yhteyttä, Jore-map on mahdollisesti pois käytöstä. Yritä päivittää sivu uudelleen tai ongelmien jatkuessa ota yhteyttä sovelluksen ylläpitäjään.';
            }
        };

        return (
            <div className={s.appLoadingPage}>
                <div className={s.messageContainer}>{renderText(props.state)}</div>
            </div>
        );
    })
);

export default AppLoadingPage;
