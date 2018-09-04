import React from 'react';
import MapStore from '../../stores/mapStore';
import fullScreenEnterIcon from '../../icons/icon-fullscreen-enter.svg';
import fullScreenExitIcon from '../../icons/icon-fullscreen-exit.svg';
import * as s from './fullscreenControl.scss';

class FullscreenControl extends React.Component{
    render() {
        const toggleFullscreen = () => {
            MapStore.toggleMapFullscreen();
        };

        return (
            <button
                className={s.fullscreenButton}
                onClick={toggleFullscreen}
            >
                <img
                    src={MapStore.isMapFullscreen ? fullScreenExitIcon : fullScreenEnterIcon}
                />
            </button>
        );
    }
}

export default FullscreenControl;
