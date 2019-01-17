import React, { ReactElement } from 'react';
import ICoordinates from '~/models/ICoordinates';
import ReactDOMServer from 'react-dom/server';
import * as L from 'leaflet';
import * as s from './nodeMarkerIcon.scss';

interface INodeMarkerIconProps {
    position: ICoordinates;
    iconHtml: ReactElement<any>;
}

export const createDivIcon = (html: React.ReactElement<any>) => {
    const renderedHtml = ReactDOMServer.renderToStaticMarkup(html);
    const divIconOptions : L.DivIconOptions = {
        html: renderedHtml,
        className: s.node,
    };

    return new L.DivIcon(divIconOptions);
};

const nodeMarkerIcon = (props: INodeMarkerIconProps) => {

    return (
        <div/>
    );
};

export default nodeMarkerIcon;
