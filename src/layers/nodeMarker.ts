import * as L from 'leaflet';
import * as s from './nodeMarker.scss';
import { ICoordinate } from '../models';

export interface NodeMarkerOptions {
    color: string;
    coordinates: ICoordinate;
}

export default class NodeMarker {
    private options: NodeMarkerOptions;
    private node: L.Marker;

    constructor(options: NodeMarkerOptions) {
        this.options = options;

        const divIconOptions : L.DivIconOptions = {
            className: s.nodeMarker,
            html: this.getNodeMarkerHtml(this.options.color),
        };

        const icon = new L.DivIcon(divIconOptions);

        const markerOptions : L.MarkerOptions = {
            icon,
            draggable: true,
        };

        this.node = new L.Marker(
            [this.options.coordinates.lat, this.options.coordinates.lon],
            markerOptions);
    }

    private getNodeMarkerHtml = (color: string) => {
        return `<div
            style="border-color: ${color};
            border-radius: 100px;
            border-style: solid;
            height: 12px;
            width: 12px;
            border-width: 3px;
            margin: -3px"
        />`;
    }

    public getNodeMarker = () => {
        return this.node;
    }
}
