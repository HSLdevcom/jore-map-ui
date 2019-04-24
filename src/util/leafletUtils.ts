import ReactDOMServer from 'react-dom/server';
import * as L from 'leaflet';
import * as s from './leafletUtils.scss';

const DEFAULT_POPUP_OFFSET = -30;

const createDivIcon = (html: any, className?: any, popupOffset?: number) => {
    const renderedHtml = ReactDOMServer.renderToStaticMarkup(html);

    const divIconOptions : L.DivIconOptions = {
        className: className ? className : s.iconClass,
        html: renderedHtml,
        // to make popup x amount (in px) above marker
        popupAnchor: [0, popupOffset ? popupOffset : DEFAULT_POPUP_OFFSET],
    };

    return new L.DivIcon(divIconOptions);
};

export default {
    createDivIcon,
};
