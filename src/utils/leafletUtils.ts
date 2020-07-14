import * as L from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import * as s from './leafletUtils.scss';

const DEFAULT_POPUP_OFFSET = -30;

interface IDivIconOptions {
    iconWidth?: number;
    iconHeight?: number;
    className?: any;
    popupOffset?: number;
}

const createDivIcon = (html: any, options: IDivIconOptions = {}) => {
    const { iconWidth, iconHeight, className, popupOffset } = options;
    const renderedHtml = ReactDOMServer.renderToStaticMarkup(html);

    const divIconOptions: L.DivIconOptions = {
        className: className ? className : s.iconClass,
        html: renderedHtml,
        popupAnchor: [0, popupOffset ? popupOffset : DEFAULT_POPUP_OFFSET],
    };
    if (iconWidth && iconHeight) {
        divIconOptions.iconSize = [iconWidth, iconHeight];
    }

    return new L.DivIcon(divIconOptions);
};

export default { createDivIcon };
