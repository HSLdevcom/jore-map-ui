import { LatLng } from 'leaflet';
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
            polylineBuilder = line;
        }
    });
    if (polylineBuilder.length > 0) {
        result.push(polylineBuilder);
    }
    return result;
};

export {
    createCoherentLinesFromPolylines,
};
