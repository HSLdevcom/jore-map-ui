import React from 'react';
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import MapStore from '../../stores/mapStore';
import ToolbarButton from './toolbar/ToolbarButton';

class FullscreenControl extends React.Component{
    private toggleFullscreen = () => {
        MapStore.toggleMapFullscreen();
    }
    render() {

        return (
            <div>
                <ToolbarButton
                    label={MapStore.isMapFullscreen ? 'Pienennä' : 'Suurenna'}
                    onClick={this.toggleFullscreen}
                    isActive={false}
                    isDisabled={false}
                >
                    {MapStore.isMapFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
                </ToolbarButton>
            </div>
        );
    }
}

export default FullscreenControl;
