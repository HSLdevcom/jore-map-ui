import * as L from 'leaflet';
import IRoutePathLink from '../models/IRoutePathLink';

const fromLatLngs = (latLngs: L.LatLng[]) => {
    let length = 0;
    latLngs.forEach((latLng, index) => {
        if (index === 0) return;
        length += latLngs[index - 1].distanceTo(latLng);
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
