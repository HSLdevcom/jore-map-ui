import classnames from 'classnames';
import * as L from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import * as s from './leafletUtils.scss';

const DEFAULT_POPUP_OFFSET = -30;

interface IDivIconOptions {
    classNames: string[];
    iconWidth?: number;
    iconHeight?: number;
    popupOffset?: number;
}

const createDivIcon = ({ html, options }: { html?: any; options: IDivIconOptions }) => {
    const { iconWidth, iconHeight, classNames, popupOffset } = options;
    const divIconOptions: L.DivIconOptions = {
        className: classNames.length > 0 ? classnames(classNames) : s.iconClass,
        popupAnchor: [0, popupOffset ? popupOffset : DEFAULT_POPUP_OFFSET],
    };
    if (html) {
        divIconOptions.html = ReactDOMServer.renderToStaticMarkup(html);
    }
    if (iconWidth && iconHeight) {
        divIconOptions.iconSize = [iconWidth, iconHeight];
    }

    return new L.DivIcon(divIconOptions);
};

export default { createDivIcon };
