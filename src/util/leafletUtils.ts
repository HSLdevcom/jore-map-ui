import ReactDOMServer from 'react-dom/server';
import * as L from 'leaflet';
import * as s from './leafletUtils.scss';

const DEFAULT_POPUP_OFFSET = -30;

interface IDivIconOptions {
    className?: any;
    popupOffset?: number;
}

const createDivIcon = (html: any, options: IDivIconOptions = {}) => {
    const renderedHtml = ReactDOMServer.renderToStaticMarkup(html);

    const divIconOptions: L.DivIconOptions = {
        className: options.className ? options.className : s.iconClass,
        html: renderedHtml,
        // to make popup x amount (in px) above marker
        popupAnchor: [
            0,
            options.popupOffset ? options.popupOffset : DEFAULT_POPUP_OFFSET
        ]
    };

    return new L.DivIcon(divIconOptions);
};

const calculateLengthFromLatLngs = (latLngs: L.LatLng[]) => {
    let length = 0;
    latLngs.forEach((latLng, index) => {
        if (index === 0) return;
        length += latLngs[index - 1].distanceTo(latLng);
    });
    return Math.round(length);
};

export default {
    createDivIcon,
    calculateLengthFromLatLngs
};
