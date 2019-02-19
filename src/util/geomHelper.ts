import { LatLng } from 'leaflet';

const createCoherentLinesFromPolylines = (polylines: LatLng[][]) => {
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

export {
    createCoherentLinesFromPolylines,
};
