import { LatLng } from 'leaflet';
import constants from '~/constants/constants';
import * as GeomHelper from '../geomHelper';

test('Concatenates leaflet lines to new coherent line', () => {
    const line1: LatLng[] = [
        new LatLng(1, 1),
        new LatLng(1, 2),
    ];
    const line2: LatLng[] = [
        new LatLng(1, 2),
        new LatLng(2, 2),
    ];
    const expectedResult: LatLng[][] = [
        [
            new LatLng(1, 1),
            new LatLng(1, 2),
            new LatLng(2, 2),
        ],
    ];
    expect(GeomHelper.createCoherentLinesFromPolylines([line1, line2]))
        .toEqual(expectedResult);
});

test('Concatenates leaflet lines to a couple of coherent lines', () => {
    const line1: LatLng[] = [
        new LatLng(1, 1),
        new LatLng(1, 2),
    ];
    const line2: LatLng[] = [
        new LatLng(1, 2),
        new LatLng(2, 2),
    ];
    const line3: LatLng[] = [
        new LatLng(2, 2),
        new LatLng(3, 2),
    ];
    const line4: LatLng[] = [
        new LatLng(3, 3),
        new LatLng(3, 4),
    ];
    const line5: LatLng[] = [
        new LatLng(3, 4),
        new LatLng(4, 5),
    ];
    const expectedResult: LatLng[][] = [
        [
            new LatLng(1, 1),
            new LatLng(1, 2),
            new LatLng(2, 2),
            new LatLng(3, 2),
        ],
        [
            new LatLng(3, 3),
            new LatLng(3, 4),
            new LatLng(4, 5),
        ],
    ];
    expect(GeomHelper.createCoherentLinesFromPolylines([line1, line2, line3, line4, line5]))
        .toEqual(expectedResult);
});

const decimals = constants.DECIMALS_IN_GEOMETRIES;

test(`Rounds LatNLong to ${decimals} number of decimals`, () => {
    const lat = 1.11111111111;
    const lng = 2.222222222222;
    const coordinate = new LatLng(lat, lng);
    const roundedCoordinate = GeomHelper.roundLatLng(coordinate);

    expect(
        roundedCoordinate.lat.toString(),
    ).toEqual(lat.toFixed(decimals));
    expect(
        roundedCoordinate.lng.toString(),
    ).toEqual(lng.toFixed(decimals));
});
