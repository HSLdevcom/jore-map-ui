import { LatLng } from 'leaflet';
import LeafletUtils from '../leafletUtils';

describe('leafletUtils.calculateLengthFromLatLngs', () => {
    it('Calculates length between two points', () => {
        const positions: LatLng[] = [
            new LatLng(60.165958, 24.9436),
            new LatLng(60.199303, 24.940759)
        ];

        // https://gps-coordinates.org/distance-between-coordinates.php
        // calculated distance to 3711.12 meters, rounds to 3711
        const expectedLength = 3711;
        expect(LeafletUtils.calculateLengthFromLatLngs(positions)).toEqual(expectedLength);
    });
});
