import {LatLng} from 'leaflet'
import {inject, observer} from 'mobx-react'
import * as React from 'react'
import {MapStore} from '../stores/mapStore'
import LeafletMap from './LeafletMap'


interface IMapState {
  center?: LatLng
  isFullScreen: boolean
  selectedRoutes: any[]
}

interface IMapProps {
  mapStore?: MapStore
}

@inject('mapStore')
@observer
class Map extends React.Component<IMapProps, IMapState> {
  constructor(props: any) {
    super(props)
    this.state = {
      isFullScreen: false,
      selectedRoutes: []
    }
  }

  public render() {
    return (
      <div>
        <LeafletMap
          center={this.props.mapStore!.getCoordinate()}
        />
      </div>)
  }
}

export default Map
