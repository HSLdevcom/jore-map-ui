import React from 'react';
import * as L from 'leaflet';
import { MapProps, Map } from 'react-leaflet';
import MapStore from '../../stores/mapStore';
import * as s from './map.scss';
import fullScreenEnterIcon from '../../icons/icon-fullscreen-enter.svg';
import fullScreenExitIcon from '../../icons/icon-fullscreen-exit.svg';

interface FullscreenControlProps {
    map: Map<MapProps, L.Map> | null;
}

class FullscreenControl extends React.Component<FullscreenControlProps> {
    constructor(props: FullscreenControlProps) {
        super(props);
    }

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
                    className={s.fullscreenButton}
                />
            </button>
        );
    }
}

export default FullscreenControl;
