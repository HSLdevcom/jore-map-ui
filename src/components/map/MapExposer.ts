import * as L from 'leaflet';

export class MapExposer {
    map: L.Map;

    initialize = (map: L.Map) => {
        this.map = map;
    }

    isInitialized = () => {
        return !!this.map;
    }

    fitBounds = (bounds: L.LatLngBounds) => {
        this.map.fitBounds(
            bounds,
            {
                maxZoom: 16,
                animate: true,
                padding: [300, 300],
            });
    }
}

export default new MapExposer();
