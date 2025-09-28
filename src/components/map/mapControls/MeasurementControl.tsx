import classnames from 'classnames'
import * as L from 'leaflet'
import React, { Component } from 'react'
import { FaEraser, FaRulerCombined, FaTrashAlt } from 'react-icons/fa'
import MapControlButton from './MapControlButton'
import * as s from './measurementControl.scss'

interface IMeasurementControlProps {
  map: any
}

interface IMeasurementControlState {
  activeTool: Tools
  measurements: number
}

enum Tools {
  NONE,
  DRAGGING,
  MEASURE = 'Aloita mittaus',
  DELETE = 'Poista mittaus',
  CLEAR = 'Poista kaikki mittaukset',
}

class MeasurementControl extends Component<
  IMeasurementControlProps,
  IMeasurementControlState
> {
  private points: L.LatLng[]
  private distance: number
  private tmpLine: L.FeatureGroup
  private lineLayer: L.FeatureGroup
  private pointLayer: L.FeatureGroup
  private measurementLayer: L.FeatureGroup

  private measurementsLayer: L.FeatureGroup
  private lastMarker: L.CircleMarker

  constructor(props: IMeasurementControlProps) {
    super(props)
    this.state = {
      activeTool: Tools.NONE,
      measurements: 0,
    }
    this.points = Array<L.LatLng>()
    this.distance = 0
    this.tmpLine = L.featureGroup()
    this.lineLayer = L.featureGroup()
    this.pointLayer = L.featureGroup()
    this.measurementLayer = L.featureGroup()

    this.measurementsLayer = L.featureGroup()
    this.getLayerContainer()
  }

  componentDidMount() {
    this.measurementsLayer.addTo(this.getLayerContainer())
  }

  private getLayerContainer = () => {
    const layerContainer = this.props.map.current.contextValue.layerContainer
    return layerContainer
  }

  private toggleMeasure = () => {
    if (this.state.activeTool === Tools.MEASURE || this.state.activeTool === Tools.DRAGGING) {
      this.disableMeasure()
    } else {
      this.enableMeasure()
    }
  }

  private enableMeasure = () => {
    this.disableRemove()
    L.DomUtil.addClass(this.getLayerContainer().getContainer(), s.measurementCursor)
    this.getLayerContainer().on('click', this.measurementClicked)
    this.getLayerContainer().doubleClickZoom.disable()
    this.setState({
      activeTool: Tools.MEASURE,
    })
  }

  private disableMeasure = () => {
    L.DomUtil.removeClass(this.getLayerContainer().getContainer(), s.measurementCursor)
    this.getLayerContainer().off('click', this.measurementClicked)
    this.getLayerContainer().off('mousemove', this.measurementMoving)
    this.getLayerContainer().doubleClickZoom.enable()
    if (this.state.activeTool === Tools.DRAGGING) {
      this.finishMeasurement()
    }
    this.setState({
      activeTool: Tools.NONE,
    })
  }

  private startNewMeasurement = () => {
    this.distance = 0
    this.points = []
    this.measurementLayer = L.featureGroup().addTo(this.measurementsLayer)
    this.lineLayer = L.featureGroup().addTo(this.measurementLayer)
    this.pointLayer = L.featureGroup().addTo(this.measurementLayer)
    this.tmpLine.addTo(this.measurementsLayer)

    this.measurementLayer.on('click', this.removeMeasurement(this.measurementLayer))
    this.setState({
      activeTool: Tools.DRAGGING,
    })
  }

  private finishMeasurementClick = (e: L.LeafletMouseEvent) => {
    e.originalEvent.preventDefault()
    e.originalEvent.stopPropagation()
    this.finishMeasurement()
  }

  private finishMeasurement = () => {
    this.setState({
      activeTool: Tools.MEASURE,
    })
    this.tmpLine.clearLayers()
    if (this.distance === 0) {
      this.measurementsLayer.removeLayer(this.measurementLayer)
    } else {
      this.setState({
        measurements: this.state.measurements + 1,
      })
      this.lastMarker.off('click', this.finishMeasurementClick).openPopup()
    }
  }

  private measurementClicked = (e: L.LeafletMouseEvent) => {
    if (this.state.activeTool !== Tools.DRAGGING) {
      this.startNewMeasurement()
    }
    const latLng = e.latlng
    if (this.points.length > 0) {
      const { x: x1, y: y1 } = this.getLayerContainer().latLngToContainerPoint(
        this.points[this.points.length - 1]
      )
      const { x: x2, y: y2 } = this.getLayerContainer().latLngToContainerPoint(latLng)
      const pxDistance = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
      if (pxDistance < 10) {
        this.finishMeasurement()
        return
      }
      this.distance += this.points[this.points.length - 1].distanceTo(latLng)
    }
    this.points.push(e.latlng)
    if (this.points.length === 1) {
      this.getLayerContainer().on('mousemove', this.measurementMoving)
    }
    this.lineLayer.clearLayers()
    L.polyline(this.points, { className: s.polyline }).addTo(this.lineLayer)
    if (this.lastMarker) {
      this.lastMarker.off('click', this.finishMeasurementClick)
    }
    this.lastMarker = L.circleMarker(latLng, { className: s.circleMarker })
      .bindPopup(`${this.distance.toFixed(2)} m`, {
        autoClose: false,
        closeOnClick: false,
        className: s.markerPopup,
      })
      .on('click', this.finishMeasurementClick)
      .addTo(this.pointLayer)
  }

  private measurementMoving = (e: L.LeafletMouseEvent) => {
    if (this.state.activeTool !== Tools.DRAGGING) return
    const movingLatLng = e.latlng
    this.tmpLine.clearLayers()
    const prevPoint = this.points[this.points.length - 1]
    L.polyline([prevPoint, movingLatLng], {
      className: classnames(s.movingPolyline, s.polyline),
      interactive: false,
    }).addTo(this.tmpLine)
    L.circleMarker(movingLatLng, {
      className: classnames(s.noEvents, s.measurementCursor, s.circleMarker),
      interactive: false,
    })
      .bindTooltip(prevPoint.distanceTo(movingLatLng).toFixed(2))
      .addTo(this.tmpLine)
      .openTooltip()
  }

  private toggleRemove = () => {
    if (this.state.activeTool === Tools.DELETE) {
      this.disableRemove()
    } else {
      this.enableRemove()
    }
  }

  private enableRemove = () => {
    this.disableMeasure()
    this.setState({
      activeTool: Tools.DELETE,
    })
  }

  private disableRemove = () => {
    this.setState({
      activeTool: Tools.NONE,
    })
  }

  private removeMeasurement = (measurement: L.Layer) => () => {
    if (this.state.activeTool === Tools.DELETE) {
      this.measurementsLayer.removeLayer(measurement)
      this.setState({
        measurements: this.state.measurements - 1,
      })
    }
    if (this.state.measurements === 0) {
      this.disableRemove()
    }
  }

  private removeAllMeasurements = () => {
    if (window.confirm('Remove all measurements?')) {
      this.measurementsLayer.clearLayers()
      this.disableMeasure()
      this.setState({
        measurements: 0,
      })
    }
  }

  render() {
    return (
      <div className={s.measurementControlView}>
        <MapControlButton
          label={Tools.MEASURE.toString()}
          onClick={this.toggleMeasure}
          isActive={
            this.state.activeTool === Tools.MEASURE || this.state.activeTool === Tools.DRAGGING
          }
          isDisabled={false} // TODO when are these disabled?
        >
          <FaRulerCombined />
        </MapControlButton>
        {this.state.measurements > 0 && (
          <>
            <MapControlButton
              label={Tools.DELETE.toString()}
              onClick={this.toggleRemove}
              isActive={this.state.activeTool === Tools.DELETE}
              isDisabled={false}
            >
              <FaEraser />
            </MapControlButton>
            <MapControlButton
              label={Tools.CLEAR.toString()}
              onClick={this.removeAllMeasurements}
              isActive={false}
              isDisabled={false}
            >
              <FaTrashAlt />
            </MapControlButton>
          </>
        )}
      </div>
    )
  }
}

export default MeasurementControl
