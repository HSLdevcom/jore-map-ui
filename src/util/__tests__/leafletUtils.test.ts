import { LatLng } from 'leaflet';
import LeafletUtils from '../leafletUtils';

describe('leafletUtils.calculateLengthFromLatLngs', () => {
    it('Calculates length between two points - round down', () => {
        const positions: LatLng[] = [
            new LatLng(60.165958, 24.9436),
            new LatLng(60.199303, 24.940759)
        ];

        // https://gps-coordinates.org/distance-between-coordinates.php
        // calculated distance to 3711.12 meters, rounds to 3711
        const expectedLength = 3711;
        expect(LeafletUtils.calculateLengthFromLatLngs(positions)).toEqual(expectedLength);
    });

    it('Calculates length between two points - round up', () => {
        const positions: LatLng[] = [
            new LatLng(60.17520298, 24.91285215),
            new LatLng(60.1745068, 24.91877853)
        ];

        // https://gps-coordinates.org/distance-between-coordinates.php
        // calculated distance to 336.77 meters, rounds to 337
        const expectedLength = 337;
        expect(LeafletUtils.calculateLengthFromLatLngs(positions)).toEqual(expectedLength);
    });
});
