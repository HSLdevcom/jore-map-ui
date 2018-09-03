import * as L from 'leaflet';
import * as s from './map.scss';
import classnames from 'classnames';

import measurementToolIcon from '../../icons/icon-ruler';
import removeToolIcon from '../../icons/icon-eraser';
import removeAllIcon from '../../icons/icon-bin';

interface MeasurementControlOptions extends L.ControlOptions {
    color?: string; // TODO use this for something
}

class MeasurementControl extends L.Control {
    private map: L.Map;
    private points: L.LatLng[];
    private distance: number;
    private active: boolean;
    private measuring: boolean;
    private tmpLine: L.FeatureGroup;
    private lineLayer: L.FeatureGroup;
    private pointLayer: L.FeatureGroup;
    private measurementLayer: L.FeatureGroup;
    private removing: boolean;
    private measurements: number;

    private measurementsLayer: L.FeatureGroup;
    private measurementToolContainer: HTMLElement;
    private removeToolContainer: HTMLElement;
    private removeAllContainer: HTMLElement;

    constructor(options?: MeasurementControlOptions) {
        super(options);
        this.points = Array<L.LatLng>();
        this.distance = 0;
        this.active = false;
        this.measuring = false;
        this.tmpLine = L.featureGroup();
        this.lineLayer = L.featureGroup();
        this.pointLayer = L.featureGroup();
        this.measurementLayer = L.featureGroup();
        this.measurements = 0;

        this.measurementsLayer = L.featureGroup();
    }

    onAdd(map: L.Map): HTMLElement {
        this.map = map;
        this.measurementsLayer.addTo(this.map);
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        container.id = s.measurementControl;

        this.measurementToolContainer = L.DomUtil.create('div', s.measurementTool, container);
        this.measurementToolContainer.innerHTML = measurementToolIcon;

        this.removeToolContainer = L.DomUtil.create('div', s.removeTool, container);
        this.removeToolContainer.innerHTML = removeToolIcon;

        this.removeAllContainer = L.DomUtil.create('div', s.removeAll, container);
        this.removeAllContainer.innerHTML = removeAllIcon;

        L.DomEvent.disableClickPropagation(container);
        this.active = false;
        L.DomEvent.on(this.measurementToolContainer, 'click', this.toggleMeasure);
        L.DomEvent.on(this.removeToolContainer, 'click', this.toggleRemove);
        L.DomEvent.on(this.removeAllContainer, 'click', this.removeAllMeasurements);
        return container;
    }

    onRemove() {
        const container = L.DomUtil.get(s.measurementControl)!;
        L.DomEvent.off(container, 'click', this.toggleMeasure);
    }

    private toggleMeasure = () => {
        if (this.active) {
            this.disableMeasure();
        } else {
            this.enableMeasure();
        }
    }

    private enableMeasure = () => {
        this.disableRemove();
        L.DomUtil.addClass(this.map.getContainer(), s.measurementCursor);
        this.active = true;
        this.map.on('click', this.measurementClicked);
        this.map.doubleClickZoom.disable();
    }

    private disableMeasure = () => {
        L.DomUtil.removeClass(this.map.getContainer(), s.measurementCursor);
        this.active = false;
        this.map.off('click', this.measurementClicked);
        this.map.off('mousemove', this.measurementMoving);
        this.map.doubleClickZoom.enable();
        this.finishMeasurement();
    }

    private startNewMeasurement = () => {
        this.measurements += 1;
        this.distance = 0;
        this.points = [];
        this.measurementLayer = L.featureGroup().addTo(this.measurementsLayer);
        this.lineLayer = L.featureGroup().addTo(this.measurementLayer);
        this.pointLayer = L.featureGroup().addTo(this.measurementLayer);
        this.tmpLine.addTo(this.measurementsLayer);

        this.measurementLayer.on('click', this.removeMeasurement(this.measurementLayer));
        this.measuring = true;
        // this.map.on('dblclick', this.finishMeasurement);
        this.showRemoveTools();
    }

    private finishMeasurement = () => {
        this.measuring = false;
        this.tmpLine.clearLayers();
        this.map.off('dblclick', this.finishMeasurement);
    }

    private measurementClicked = (e: L.LeafletMouseEvent) => {
        if (!this.measuring) {
            this.startNewMeasurement();
        }
        const latLng = e.latlng;
        if (this.points.length > 0) {
            this.distance +=
                this.points[this.points.length - 1].distanceTo(latLng);
        }
        this.points.push(e.latlng);
        if (this.points.length === 1) {
            this.map.on('mousemove', this.measurementMoving);
        }
        this.lineLayer.clearLayers();
        L.polyline(this.points, { className: s.polyline }).addTo(this.lineLayer);
        L.circleMarker(latLng, { className: s.circleMarker })
            .bindPopup(
                `${this.distance.toFixed(2)} meters`, {
                    autoClose: false,
                    closeOnClick: false,
                })
            .openPopup()
            .on('click', this.finishMeasurement)
            .addTo(this.pointLayer);
    }

    private measurementMoving = (e: L.LeafletMouseEvent) => {
        if (!this.measuring) return;
        const movingLatLng = e.latlng;
        this.tmpLine.clearLayers();
        const prevPoint = this.points[this.points.length - 1];
        L.polyline(
            [prevPoint, movingLatLng],
            { className: classnames(s.movingPolyline, s.polyline) })
            .on('click', this.measurementClicked)
            .addTo(this.tmpLine);
        L.circleMarker(movingLatLng,
                       { className: classnames(s.noEvents, s.measurementCursor, s.circleMarker) })
            .on('click', this.measurementClicked)
            .bindTooltip(prevPoint.distanceTo(movingLatLng).toFixed(2))
            .openTooltip()
            .addTo(this.tmpLine);
    }

    private showRemoveTools = () => {
        L.DomUtil.addClass(this.removeToolContainer, s.show);
        L.DomUtil.addClass(this.removeAllContainer, s.show);
    }

    private hideRemoveTools = () => {
        L.DomUtil.removeClass(this.removeToolContainer, s.show);
        L.DomUtil.removeClass(this.removeAllContainer, s.show);
    }

    private toggleRemove = () => {
        if (this.removing) {
            this.disableRemove();
        } else {
            this.enableRemove();
        }
    }

    private enableRemove = () => {
        this.removing = true;
        this.finishMeasurement();
        this.disableMeasure();
    }

    private disableRemove = () => {
        this.removing = false;
    }

    private removeMeasurement = (measurement: L.Layer) => () => {
        if (this.removing) {
            this.measurementsLayer.removeLayer(measurement);
            this.measurements -= 1;
        }
        if (this.measurements === 0) {
            this.disableRemove();
            this.hideRemoveTools();
        }
    }

    private removeAllMeasurements = () => {
        if (window.confirm('Remove all measurements?')) {
            this.measurementsLayer.clearLayers();
            this.hideRemoveTools();
            this.disableMeasure();
            this.measurements = 0;
        }
    }
}

export default MeasurementControl;
