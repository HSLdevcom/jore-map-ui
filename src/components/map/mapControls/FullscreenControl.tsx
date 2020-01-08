import React from 'react';
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import MapStore from '~/stores/mapStore';
import MapControlButton from './MapControlButton';
import * as s from './fullscreenControl.scss';

const toggleFullscreen = () => {
    MapStore.toggleMapFullscreen();
};

const FullscreenControl = () => (
    <div className={s.fullscreenControlView}>
        <MapControlButton
            label={MapStore.isMapFullscreen ? 'Pienennä' : 'Suurenna'}
            onClick={toggleFullscreen}
            isActive={false}
            isDisabled={false}
            hasNoPadding={true}
        >
            {MapStore.isMapFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
        </MapControlButton>
    </div>
);

export default FullscreenControl;
