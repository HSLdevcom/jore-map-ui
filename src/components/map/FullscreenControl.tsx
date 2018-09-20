import React from 'react';
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import MapStore from '../../stores/mapStore';
import * as s from './fullscreenControl.scss';
import * as mapStyle from './map.scss';

class FullscreenControl extends React.Component{
    private toggleFullscreen = () => {
        MapStore.toggleMapFullscreen();
    }
    render() {

        return (
            <div className={s.fullscreenControlView}>
                <div
                    title={MapStore.isMapFullscreen ? 'Pienennä' : 'Suurenna'}
                    onClick={this.toggleFullscreen}
                    className={mapStyle.control}
                >
                    {MapStore.isMapFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
                </div>
            </div>
        );
    }
}

export default FullscreenControl;
