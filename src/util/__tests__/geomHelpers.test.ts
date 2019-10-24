import { LatLng } from 'leaflet';
import constants from '~/constants/constants';
import {
    calculateLengthFromLatLngs,
    createCoherentLinesFromPolylines,
    roundLatLng
} from '../geomHelpers';

describe('geomHelpers.createCoherentLinesFromPolylines', () => {
    it('Concatenates 1 line into 1 line', () => {
        const line: LatLng[] = [new LatLng(1, 1), new LatLng(1, 2), new LatLng(2, 3)];
        const expectedResult: LatLng[][] = [[new LatLng(1, 1), new LatLng(1, 2), new LatLng(2, 3)]];
        expect(createCoherentLinesFromPolylines([line])).toEqual(expectedResult);
    });

    it('Concatenates 2 lines into 1 line', () => {
        const line1: LatLng[] = [new LatLng(1, 1), new LatLng(1, 2)];
        const line2: LatLng[] = [new LatLng(1, 2), new LatLng(2, 2), new LatLng(2, 3)];
        const expectedResult: LatLng[][] = [
            [new LatLng(1, 1), new LatLng(1, 2), new LatLng(2, 2), new LatLng(2, 3)]
        ];
        expect(createCoherentLinesFromPolylines([line1, line2])).toEqual(expectedResult);
    });

    it('Concatenates multiple lines into 2 lines', () => {
        const line1: LatLng[] = [new LatLng(1, 1), new LatLng(1, 2)];
        const line2: LatLng[] = [new LatLng(1, 2), new LatLng(2, 2)];
        const line3: LatLng[] = [new LatLng(2, 2), new LatLng(3, 2)];
        const line4: LatLng[] = [new LatLng(3, 3), new LatLng(3, 4)];
        const line5: LatLng[] = [new LatLng(3, 4), new LatLng(4, 5)];
        const expectedResult: LatLng[][] = [
            [new LatLng(1, 1), new LatLng(1, 2), new LatLng(2, 2), new LatLng(3, 2)],
            [new LatLng(3, 3), new LatLng(3, 4), new LatLng(4, 5)]
        ];
        expect(createCoherentLinesFromPolylines([line1, line2, line3, line4, line5])).toEqual(
            expectedResult
        );
    });
});

describe('geomHelpers.roundLatLng', () => {
    const DECIMALS_IN_GEOMETRIES = constants.DECIMALS_IN_GEOMETRIES;

    it(`Rounds latLng to ${DECIMALS_IN_GEOMETRIES} number of decimals`, () => {
        const lat = 1.11111111111;
        const lng = 2.222222222222;
        const coordinate = new LatLng(lat, lng);
        const roundedCoordinate = roundLatLng(coordinate);

        expect(roundedCoordinate.lat.toString()).toEqual(lat.toFixed(DECIMALS_IN_GEOMETRIES));
        expect(roundedCoordinate.lng.toString()).toEqual(lng.toFixed(DECIMALS_IN_GEOMETRIES));
    });
});

describe('geomHelpers.calculateLengthFromLatLngs', () => {
    it('Calculates length between two points - round down', () => {
        const positions: LatLng[] = [
            new LatLng(60.165958, 24.9436),
            new LatLng(60.199303, 24.940759)
        ];

        // https://gps-coordinates.org/distance-between-coordinates.php
        // calculated distance to 3711.12 meters, rounds to 3711
        const expectedLength = 3711;
        expect(calculateLengthFromLatLngs(positions)).toEqual(expectedLength);
    });

    it('Calculates length between two points - round up', () => {
        const positions: LatLng[] = [
            new LatLng(60.17520298, 24.91285215),
            new LatLng(60.1745068, 24.91877853)
        ];

        // https://gps-coordinates.org/distance-between-coordinates.php
        // calculated distance to 336.77 meters, rounds to 337
        const expectedLength = 337;
        expect(calculateLengthFromLatLngs(positions)).toEqual(expectedLength);
    });
});
