import { LatLng } from 'leaflet';
import Constants from '~/constants/constants';

/**
*    Tries to merge polylines where they connect,
*    and returns a set of coherent polylines.
*/
const createCoherentLinesFromPolylines = (polylines: LatLng[][]): LatLng[][] => {
    const result: LatLng[][] = [];
    let polylineBuilder: LatLng[] = [];
    polylines.forEach((line) => {
        if (
            polylineBuilder.length === 0
            || polylineBuilder[polylineBuilder.length - 1].equals(line[0])) {
            polylineBuilder = polylineBuilder.concat(line);
        } else {
            result.push(polylineBuilder);
            polylineBuilder = [];
        }
    });
    if (polylineBuilder.length > 0) {
        result.push(polylineBuilder);
    }
    return result;
};

const _roundNumber = (num: number) => {
    const DECIMALS = Constants.DECIMALS_IN_GEOMETRIES;
    return Math.round(num * Math.pow(10, DECIMALS)) / Math.pow(10, DECIMALS);
};

const roundLatLng = (coordinate: LatLng) => {
    return new LatLng(_roundNumber(coordinate.lat), _roundNumber(coordinate.lng));
};

export {
    createCoherentLinesFromPolylines,
    roundLatLng,
};
