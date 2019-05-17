import * as L from 'leaflet';
import IRoutePathLink from '../models/IRoutePathLink';

const fromLatLngs = (geometry: L.LatLng[]) => {
    let length = 0;
    geometry.forEach((position, index) => {
        if (index === 0) return;
        length += geometry[index - 1].distanceTo(position);
    });
    return length;
};

const fromRoutePathLinks = (rpLinks: IRoutePathLink[]) => {
    return rpLinks.reduce((total, rpLink) => {
        return total + fromLatLngs(rpLink.geometry);
    }, 0);
};

export default {
    fromRoutePathLinks,
    fromLatLngs
};
