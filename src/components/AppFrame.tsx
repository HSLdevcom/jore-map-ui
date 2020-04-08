import React from 'react';
import ErrorBar from './ErrorBar';
import NavigationBar from './NavigationBar';
import * as s from './appFrame.scss';
import Map from './map/Map';
import OverlayContainer from './overlays/OverlayContainer';
import Sidebar from './sidebar/Sidebar';

class AppFrame extends React.PureComponent {
    render() {
        return (
            <>
                <NavigationBar />
                <div className={s.appContent}>
                    {/* Map needs to be rendered before <Sidebar /> so that listeners get initialized before Views set map coordinates. */}
                    <Map>
                        <ErrorBar />
                    </Map>
                    <Sidebar />
                </div>
                <OverlayContainer />
            </>
        );
    }
}

export default AppFrame;
