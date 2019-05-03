import { LatLng } from 'leaflet';
import Constants from '~/constants/constants';

/**
 *    Tries to merge polylines where they connect,
 *    and returns a set of coherent polylines.
 */
const createCoherentLinesFromPolylines = (
    polylines: LatLng[][]
): LatLng[][] => {
    const result: LatLng[][] = [];
    let polylineBuilder: LatLng[] = [];
    polylines.forEach(line => {
        if (polylineBuilder.length === 0) {
            // Initially set the first line as the initial coherent line
            polylineBuilder = line;
        } else if (
            polylineBuilder[polylineBuilder.length - 1].equals(line[0])
        ) {
            // If the line has the same start point as the previous end point, concat it to the end
            polylineBuilder = polylineBuilder.concat(
                line.slice(1, line.length)
            );
        } else {
            // If there is a gap between this line and the previous.
            // Push the created coherent to the result, and start creating the next coherent line.
            result.push(polylineBuilder);
            polylineBuilder = line;
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
    return new LatLng(
        _roundNumber(coordinate.lat),
        _roundNumber(coordinate.lng)
    );
};

export { createCoherentLinesFromPolylines, roundLatLng };
