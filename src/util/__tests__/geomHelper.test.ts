import { LatLng } from 'leaflet';
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
