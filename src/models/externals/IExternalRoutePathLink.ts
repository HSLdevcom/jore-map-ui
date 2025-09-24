import TransitType from '~/enums/transitType'
import IExternalLink from './IExternalLink'
import IExternalNode from './IExternalNode'

interface IExternalRoutePathLink {
  linkkiByLnkverkkoAndLnkalkusolmuAndLnkloppusolmu: IExternalLink
  solmuByLnkalkusolmu: IExternalNode
  solmuByLnkloppusolmu: IExternalNode
  reitunnus: string
  suusuunta: string
  suuvoimast: string
  relid: number
  reljarjnro: number
  relohaikpys?: string
  relpysakki: string
  lnkverkko: TransitType
  ajantaspys?: string
  paikka?: string
  kirjaan?: string
  kirjasarake?: number
  relkuka?: string
  relviimpvm?: Date
}

interface IExternalRoutePathSegmentLink {
  reitunnus: string
  suusuunta: string
  suuvoimast: Date
  relid: number
  reljarjnro: number
  lnkalkusolmu: string
  lnkloppusolmu: string
  suuvoimviimpvm: Date
  suulahpaik: string
  suupaapaik: string
  geom: string
}

export default IExternalRoutePathLink

export { IExternalRoutePathSegmentLink }
