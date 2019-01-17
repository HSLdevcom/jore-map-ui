import * as L from 'leaflet';
import IRoutePathLink from '../models/IRoutePathLink';

const betweenCoordinates = (start: [number, number], end: [number, number]) => {
    return L.latLng(start).distanceTo(L.latLng(end));
};

const fromPositions = (positions: [[number, number]]) => {
    let length = 0;
    positions.forEach((position, index) => {
        if (index === 0) return;
        length += betweenCoordinates(positions[index - 1], position);
    });
    return length;
};

const fromRoutePathLinks = (rpLinks: IRoutePathLink[]) => {
    return rpLinks.reduce(
        (total, rpLink) => {
            return total + fromPositions(rpLink.positions);
        },
        0);
};

export default {
    fromRoutePathLinks,
};
