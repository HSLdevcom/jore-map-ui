import React from 'react';
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import MapStore from '~/stores/mapStore';
import * as s from './fullscreenControl.scss';
import MapControlButton from './MapControlButton';

class FullscreenControl extends React.Component{
    private toggleFullscreen = () => {
        MapStore.toggleMapFullscreen();
    }
    render() {

        return (
            <div className={s.fullscreenControlView}>
                <MapControlButton
                    label={MapStore.isMapFullscreen ? 'Pienennä' : 'Suurenna'}
                    onClick={this.toggleFullscreen}
                    isActive={false}
                    isDisabled={false}
                >
                    {MapStore.isMapFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
                </MapControlButton>
            </div>
        );
    }
}

export default FullscreenControl;
