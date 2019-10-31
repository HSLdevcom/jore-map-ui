import * as L from 'leaflet';
import { autorun } from 'mobx';
import GeometryService from '~/services/geometryService';
import observableMapStore, { MapStore } from '~/stores/mapStore';
import * as s from './coordinateControl.scss';

interface ICoordinateControlOptions extends L.ControlOptions {
    precision?: number;
}

// TODO: Convert as react-component
class CoordinateControl extends L.Control {
    private mapStore: MapStore;
    private xButton: HTMLElement;
    private xInput: HTMLInputElement;
    private yButton: HTMLElement;
    private yInput: HTMLInputElement;
    constructor(options?: ICoordinateControlOptions) {
        super(options);
        if (!this.options['precision']) {
            this.options['precision'] = 10;
        }
        this.mapStore = observableMapStore;
    }

    onAdd(map: L.Map) {
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
            this.mapStore!.setDisplayCoordinateSystem(
                GeometryService.nextCoordinateSystem(this.mapStore!.displayCoordinateSystem)
            );
        };
        L.DomEvent.disableClickPropagation(container);
        autorun(() => this.updateCoordinates());
        return container;
    }

    private setInputAsCenter = (lat: number, lon: number) => {
        this.mapStore!.setCoordinatesFromDisplayCoordinateSystem(lat, lon);
    };

    private updateCoordinates() {
        [this.xInput.value, this.yInput.value] = this.getDisplayCoordinates().map(coord =>
            coord.toPrecision(this.options['precision'])
        );
        ({ x: this.xButton.innerText, y: this.yButton.innerText } = GeometryService.coordinateNames(
            this.mapStore!.displayCoordinateSystem
        ));
    }

    private getDisplayCoordinates() {
        const coordinates = this.mapStore!.coordinates;
        const displayCoordinateSystem = this.mapStore!.displayCoordinateSystem;
        return GeometryService.reprojectToCrs(
            coordinates!.lat,
            coordinates!.lng,
            displayCoordinateSystem
        );
    }
}

export default CoordinateControl;
