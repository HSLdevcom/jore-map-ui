import ReactDOMServer from 'react-dom/server';
import * as L from 'leaflet';
import * as s from './leafletUtils.scss';

const createDivIcon = (html: any, className?: any) => {
    const renderedHtml = ReactDOMServer.renderToStaticMarkup(html);
    const divIconOptions : L.DivIconOptions = {
        className: className ? className : s.iconClass,
        html: renderedHtml,
        popupAnchor: [0, -30], // to make popup 30 px above marker
    };

    return new L.DivIcon(divIconOptions);
};

export default {
    createDivIcon,
};
