/* tslint:disable */
import * as React from 'react';
import * as L from 'leaflet';
import classnames from 'classnames';
import { FaEraser, FaRulerCombined, FaTrashAlt } from 'react-icons/fa';
import ToolbarButton from './toolbar/ToolbarButton';
import * as s from './measurementControl.scss';

interface IMeasurementControlProps{
    leaflet?: any;
}

interface IMeasurementControlState {
    measuring: boolean;
    removing: boolean;
    activeTool: Tools;
    measurements: number;
}

enum Tools {
    NONE,
    MEASURE = 'Aloita mittaus',
    DELETE = 'Poista mittaus',
    CLEAR = 'Poista kaikki mittaukset',
}

class MeasurementControl extends React.Component<IMeasurementControlProps,
                                            IMeasurementControlState> {
    private points: L.LatLng[];
    private distance: number;
    private tmpLine: L.FeatureGroup;
    private lineLayer: L.FeatureGroup;
    private pointLayer: L.FeatureGroup;
    private measurementLayer: L.FeatureGroup;

    private measurementsLayer: L.FeatureGroup;
    private lastMarker: L.CircleMarker;

    constructor(props: IMeasurementControlProps) {
        super(props);
        this.state = {
            measuring: false,
            removing: false,
            activeTool: Tools.NONE,
            measurements: 0,
        };
        this.points = Array<L.LatLng>();
        this.distance = 0;
        this.tmpLine = L.featureGroup();
        this.lineLayer = L.featureGroup();
        this.pointLayer = L.featureGroup();
        this.measurementLayer = L.featureGroup();

        this.measurementsLayer = L.featureGroup();
    }

    componentDidMount() {
        this.measurementsLayer.addTo(this.props.leaflet!.layerContainer);
    }

    private toggleMeasure = () => {
        if (this.state.activeTool === Tools.MEASURE) {
            this.disableMeasure();
        } else {
            this.enableMeasure();
        }
    }

    private enableMeasure = () => {
        this.disableRemove();
        L.DomUtil.addClass(this.props.leaflet!.layerContainer.getContainer(), s.measurementCursor);
        this.props.leaflet!.layerContainer.on('click', this.measurementClicked);
        this.props.leaflet!.layerContainer.doubleClickZoom.disable();
        this.setState({
            activeTool: Tools.MEASURE,
        });
    }

    private disableMeasure = () => {
        L.DomUtil.removeClass(this.props.leaflet!.layerContainer.getContainer(), s.measurementCursor);
        this.props.leaflet!.layerContainer.off('click', this.measurementClicked);
        this.props.leaflet!.layerContainer.off('mousemove', this.measurementMoving);
        this.props.leaflet!.layerContainer.doubleClickZoom.enable();
        if (this.state.measuring) {
            this.finishMeasurement();
        }
        this.setState({
            activeTool: Tools.NONE,
        });
    }

    private startNewMeasurement = () => {
        this.distance = 0;
        this.points = [];
        this.measurementLayer = L.featureGroup().addTo(this.measurementsLayer);
        this.lineLayer = L.featureGroup().addTo(this.measurementLayer);
        this.pointLayer = L.featureGroup().addTo(this.measurementLayer);
        this.tmpLine.addTo(this.measurementsLayer);

        this.measurementLayer.on('click', this.removeMeasurement(this.measurementLayer));
        this.setState({
            measuring: true,
        })
    }

    private finishMeasurementClick = (e: L.LeafletMouseEvent) => {
        e.originalEvent.preventDefault();
        e.originalEvent.stopPropagation();
        this.finishMeasurement();
    }

    private finishMeasurement = () => {
        this.setState({
            measuring: false,
        })
        this.tmpLine.clearLayers();
        if (this.distance === 0) {
            this.measurementsLayer.removeLayer(this.measurementLayer);
        } else {
            this.setState({
                measurements: this.state.measurements + 1
            })
            this.lastMarker.openPopup();
        }
    }

    private measurementClicked = (e: L.LeafletMouseEvent) => {
        if (!this.state.measuring) {
            this.startNewMeasurement();
        }
        const latLng = e.latlng;
        if (this.points.length > 0) {
            const { x: x1, y: y1 } =
                this.props.leaflet!.layerContainer.latLngToContainerPoint(this.points[this.points.length - 1]);
            const { x: x2, y: y2 } =
                this.props.leaflet!.layerContainer.latLngToContainerPoint(latLng);
            const pxDistance = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
            if (pxDistance < 10) {
                this.finishMeasurement();
                return;
            }
            this.distance +=
                this.points[this.points.length - 1].distanceTo(latLng);
        }
        this.points.push(e.latlng);
        if (this.points.length === 1) {
            this.props.leaflet!.layerContainer.on('mousemove', this.measurementMoving);
        }
        this.lineLayer.clearLayers();
        L.polyline(this.points, { className: s.polyline }).addTo(this.lineLayer);
        this.lastMarker = L.circleMarker(latLng, { className: s.circleMarker })
            .bindPopup(
                `${this.distance.toFixed(2)} meters`, {
                    autoClose: false,
                    closeOnClick: false,
                })
            .on('click', this.finishMeasurementClick)
            .addTo(this.pointLayer);
    }

    private measurementMoving = (e: L.LeafletMouseEvent) => {
        if (!this.state.measuring) return;
        const movingLatLng = e.latlng;
        this.tmpLine.clearLayers();
        const prevPoint = this.points[this.points.length - 1];
        L.polyline(
            [prevPoint, movingLatLng],
            { className: classnames(s.movingPolyline, s.polyline), interactive: false })
            .addTo(this.tmpLine);
        L.circleMarker(movingLatLng, {
            className: classnames(s.noEvents, s.measurementCursor, s.circleMarker),
            interactive: false,
        })
            .bindTooltip(prevPoint.distanceTo(movingLatLng).toFixed(2))
            .addTo(this.tmpLine)
            .openTooltip();
    }

    private toggleRemove = () => {
        if (this.state.removing) {
            this.disableRemove();
        } else {
            this.enableRemove();
        }
    }

    private enableRemove = () => {
        this.setState({
            removing: true,
        })
        this.disableMeasure();
        this.setState({
            activeTool: Tools.DELETE,
        });
    }

    private disableRemove = () => {
        this.setState({
            removing: false,
        })
        this.setState({
            activeTool: Tools.NONE,
        });
    }

    private removeMeasurement = (measurement: L.Layer) => () => {
        if (this.state.removing) {
            this.measurementsLayer.removeLayer(measurement);
            this.setState({
                measurements: this.state.measurements - 1
            })
        }
        if (this.state.measurements === 0) {
            this.disableRemove();
        }
    }

    private removeAllMeasurements = () => {
        if (window.confirm('Remove all measurements?')) {
            this.measurementsLayer.clearLayers();
            this.disableMeasure();
            this.setState({
                measurements: 0
            })
        }
    }

    render() {
        return(
            <div className={s.measurementControlView}>
                <ToolbarButton
                    label={Tools.MEASURE.toString()}
                    onClick={this.toggleMeasure}
                    isActive={this.state.activeTool === Tools.MEASURE}
                    isDisabled={false} // TODO when are these disabled?
                >
                    <FaRulerCombined />
                </ToolbarButton>
                {this.state.measurements > 0 &&
                    <>
                        <ToolbarButton
                            label={Tools.DELETE.toString()}
                            onClick={this.toggleRemove}
                            isActive={this.state.activeTool === Tools.DELETE}
                            isDisabled={false}
                        >
                            <FaEraser />
                        </ToolbarButton>
                        <ToolbarButton
                            label={Tools.CLEAR.toString()}
                            onClick={this.removeAllMeasurements}
                            isActive={false}
                            isDisabled={false}
                        >
                            <FaTrashAlt />
                        </ToolbarButton>
                    </>
                }
            </div>
        );
    }
}

export default MeasurementControl;
