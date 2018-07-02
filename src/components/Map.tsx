import {LatLng} from 'leaflet'
import * as React from 'react'
import LeafletMap from './LeafletMap'


interface IMapState {
  center: LatLng
  isFullScreen: boolean
  selectedRoutes: any[]
}
//
// interface IMapProps {
// }

class Map extends React.Component<{}, IMapState> {
  constructor(props: any) {
    super(props)
    this.state = {
      center: new LatLng(60.23, 24.9),
      isFullScreen: false,
      selectedRoutes: []
    }
  }

  public render() {
    return (
      <div>
        <LeafletMap
          center={this.state.center}
        />
      </div>)
  }
}

export default Map
