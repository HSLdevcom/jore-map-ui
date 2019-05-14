import { LatLng } from 'leaflet';
import lengthCalculator from '../lengthCalculator';

describe('lengthCalculator.fromPositions', () => {
    it('Calculates length of two positions', () => {
        const positions: LatLng[] = [
            new LatLng(60.165958, 24.9436),
            new LatLng(60.199303, 24.940759)
        ];

        // https://gps-coordinates.org/distance-between-coordinates.php
        // calculated distance to 3711.12 meters
        const expectedLength = 3711;
        expect(Math.floor(lengthCalculator.fromPositions(positions))).toEqual(
            expectedLength
        );
    });
});
