import React from 'react';
import { observer } from 'mobx-react';
import MapStore from '../../stores/mapStore';
import * as s from './fullscreenControl.scss';
import fullScreenEnterIcon from '../../icons/icon-fullscreen-enter.svg';
import fullScreenExitIcon from '../../icons/icon-fullscreen-exit.svg';

@observer
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
