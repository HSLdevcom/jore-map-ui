import IExternalLine from './IExternalLine'
import IExternalRoutePath from './IExternalRoutePath'
import IGraphqlList from './graphqlModelHelpers/IGraphqlList'

export default interface IExternalRoute {
  reitinsuuntasByReitunnus: IGraphqlList<IExternalRoutePath>
  linjaByLintunnus: IExternalLine
  reitunnus: string
  reinimi: string
  reinimir: string
  lintunnus: string
  isUsedByRoutePath?: boolean
  reikuka?: string
  reiviimpvm?: Date
}
