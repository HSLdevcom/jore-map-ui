import { observer } from 'mobx-react';
import React from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
import Constants from '~/constants/constants';
import mapStore from '~/stores/mapStore';
import networkStore from '~/stores/networkStore';
import * as s from './mapLayersZoomHint.scss';

@observer
class MapLayersZoomHint extends React.Component {
    render() {
        const mapZoomLevel = mapStore.zoom;
        const isMapLayersVisible = networkStore.isMapLayersVisible;
        if (!isMapLayersVisible || mapZoomLevel > Constants.MAP_LAYERS_MIN_ZOOM_LEVEL) {
            return null;
        }

        return (
            <div className={s.mapLayersZoomHint}>
                <FaExclamationCircle className={s.exclamationMark} />
                Zoomaa lähemmäksi, jotta voit tarkastella verkon tasoja.
            </div>
        );
    }
}

export default MapLayersZoomHint;
