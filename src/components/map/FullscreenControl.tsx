import * as L from 'leaflet';
import observableMapStore, { MapStore } from '../../stores/mapStore';
import * as s from './map.scss';
import fullScreenEnterIcon from '../../icons/icon-fullscreen-enter.svg';
import fullScreenExitIcon from '../../icons/icon-fullscreen-exit.svg';

interface IFullscreenControlOptions extends L.ControlOptions {
    color?: string; // TODO Use this for something.
}

class FullscreenControl extends L.Control {
    private mapStore: MapStore;
    private map: L.Map;
    constructor(options?: IFullscreenControlOptions) {
        super(options);
        this.mapStore = observableMapStore;
    }

    onAdd(map: L.Map) {
        this.map = map;
        const icon = L.DomUtil.create('img');
        const container = L.DomUtil.create('button', 'leaflet-bar leaflet-control');
        container.id = 'fullscreenControl';
        icon.setAttribute('src', fullScreenEnterIcon);
        icon.className = s.fullscreenButton;
        container.className = s.fullscreenButton;
        container.appendChild(icon);
        container.onclick = () => {
            this.mapStore!.toggleMapFullscreen();
            icon.setAttribute(
                'src',
                this.mapStore!.isMapFullscreen
                    ? fullScreenExitIcon : fullScreenEnterIcon);
            this.map.invalidateSize();
        };
        L.DomEvent.disableClickPropagation(container);
        return container;
    }
}

export default FullscreenControl;
