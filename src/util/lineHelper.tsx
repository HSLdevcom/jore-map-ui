import * as React from 'react'
import BusIcon from '../icons/icon-bus'
import FerryIcon from '../icons/icon-ferry'
import SubwayIcon from '../icons/icon-subway'
import TrainIcon from '../icons/icon-train'
import TramIcon from '../icons/icon-tram'

class LineHelper {

  public static parseLineNumber = (lineId: string) => {
    return lineId.substring(1).replace(/^0+/, '')
  }

  public static getTransitIcon = (linjoukkollaji: string, withoutBox: boolean) => {
    switch(linjoukkollaji) {
      case 'bus':
        return <BusIcon height={'24'} withoutBox={withoutBox}/>
      case 'subway':
        return <SubwayIcon height={'24'} withoutBox={withoutBox}/>
      case 'tram':
        return <TramIcon height={'24'} withoutBox={withoutBox}/>
      case 'train':
        return <TrainIcon height={'24'} withoutBox={withoutBox}/>
      case 'ferry':
        return <FerryIcon height={'24'} withoutBox={withoutBox}/>
      default:
        return <div>puuttuu</div>
    }
  }

  public static getReiTunnus = (edge: any) => {
    if (!edge || !edge.node.reinimi) {
      return 'Reitillä ei nimeä'
    }
    return edge.node.reinimi
  }

  public static convertTransitTypeCodeToTransitType = (type: string) => {
    switch(type) {
      case '1':
        return 'bus'
      case '2':
        return 'subway'
      case '3':
        return 'tram'
      case '4':
        return 'train'
      case '7':
        return 'ferry'
      default:
        return '-1'
    }
  }

}

export default LineHelper
