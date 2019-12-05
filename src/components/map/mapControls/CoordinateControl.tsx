import * as L from 'leaflet';
import { autorun } from 'mobx';
import React, { Component } from 'react';
import GeometryService from '~/services/geometryService';
import MapStore from '~/stores/mapStore';
import * as s from './coordinateControl.scss';

interface ICoordinateControlProps {
    precision?: number;
}

const PRECISION_DEFAULT_VALUE = 10;

class CoordinateControl extends Component<ICoordinateControlProps> {
    private xButton: HTMLElement;
    private xInput: HTMLInputElement;
    private yButton: HTMLElement;
    private yInput: HTMLInputElement;

    constructor(props: ICoordinateControlProps) {
        super(props);

        autorun(() => this.updateCoordinates());
    }

    private setInputAsCenter = (lat: number, lon: number) => {
        MapStore!.setCoordinatesFromDisplayCoordinateSystem(lat, lon);
    };

    private updateCoordinates() {
        if (!MapStore!.coordinates) return;

        [this.xInput.value, this.yInput.value] = this.getDisplayCoordinates().map(coord =>
            coord.toPrecision(this.props.precision ? this.props.precision : PRECISION_DEFAULT_VALUE)
        );
        ({ x: this.xButton.innerText, y: this.yButton.innerText } = GeometryService.coordinateNames(
            MapStore!.displayCoordinateSystem
        ));
    }

    private getDisplayCoordinates() {
        const coordinates = MapStore!.coordinates;
        const displayCoordinateSystem = MapStore!.displayCoordinateSystem;
        return GeometryService.reprojectToCrs(
            coordinates!.lat,
            coordinates!.lng,
            displayCoordinateSystem
        );
    }

    render() {
        if (!MapStore!.coordinates) return null;

        const [lat, lon] = this.getDisplayCoordinates();
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        container.id = s.coordinateControl;
        const xDiv = L.DomUtil.create('div');
        this.xButton = L.DomUtil.create('button');
        this.xButton.innerText = 'Lat';
        this.xInput = L.DomUtil.create('input', '') as HTMLInputElement;
        this.xInput.id = 'xcoord';
        this.xInput.tabIndex = 1;
        xDiv.appendChild(this.xButton);
        xDiv.appendChild(this.xInput);
        this.xInput.value = lat.toString(10);
        const yDiv = L.DomUtil.create('div');
        this.yButton = L.DomUtil.create('button');
        this.yButton.innerText = 'Lon';
        this.yInput = L.DomUtil.create('input', '') as HTMLInputElement;
        this.yInput.id = 'ycoord';
        this.yInput.tabIndex = 2;
        yDiv.appendChild(this.yButton);
        yDiv.appendChild(this.yInput);
        container.appendChild(xDiv);
        container.appendChild(yDiv);
        this.yInput.value = lon.toString(10);

        this.xInput.onblur = this.yInput.onblur = e => {
            const newX = Number(this.xInput.value);
            const newY = Number(this.yInput.value);
            if (!isNaN(newY) && !isNaN(newX)) {
                this.setInputAsCenter(newX, newY);
            }
        };
        this.xInput.onkeypress = this.yInput.onkeypress = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                this.xInput.blur();
                this.yInput.blur();
            }
        };
        this.xButton.onclick = this.yButton.onclick = () => {
            MapStore!.setDisplayCoordinateSystem(
                GeometryService.nextCoordinateSystem(MapStore!.displayCoordinateSystem)
            );
        };
        L.DomEvent.disableClickPropagation(container);

        return <div>{container}</div>;
    }
}

export default CoordinateControl;
