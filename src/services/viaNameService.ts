import { ApolloQueryResult } from 'apollo-client'
import Moment from 'moment'
import ViaNameFactory from '~/factories/viaNameFactory'
import apolloClient from '~/helpers/ApolloClient'
import { IViaName } from '~/models'
import { IRoutePathPrimaryKey } from '~/models/IRoutePath'
import IViaShieldName from '~/models/IViaShieldName'
import IExternalViaName from '~/models/externals/IExternalViaName'
import IExternalViaShieldName from '~/models/externals/IExternalViaShieldName'
import GraphqlQueries from './graphqlQueries'

class ViaNameService {
  public static fetchViaNamesByRpPrimaryKey = async (
    key: IRoutePathPrimaryKey
  ): Promise<IViaName[]> => {
    const queryResult: ApolloQueryResult<any> = await apolloClient.query({
      query: GraphqlQueries.getViaNamesByRpPrimaryKeyQuery(),
      variables: {
        routeId: key.routeId,
        startDate: Moment(key.startDate).format(),
        direction: key.direction,
      },
    })
    const externalViaNames: IExternalViaName[] = queryResult.data.get_via_names.nodes
    return externalViaNames.map((extViaName) =>
      ViaNameFactory.parseExternalViaName({
        viaNameId: extViaName.relid,
        externalViaName: extViaName,
      })
    )
  }

  public static fetchViaNameById = async (viaNameId: number): Promise<IViaName> => {
    const queryResult: ApolloQueryResult<any> = await apolloClient.query({
      query: GraphqlQueries.getViaNameByIdKeyQuery(),
      variables: {
        relid: viaNameId,
      },
    })
    const externalViaName: IExternalViaName | null = queryResult.data.viaNimetByRelid
    return ViaNameFactory.parseExternalViaName({ viaNameId, externalViaName })
  }

  public static fetchViaShieldNamesByRpPrimaryKey = async (
    key: IRoutePathPrimaryKey
  ): Promise<IViaShieldName[]> => {
    const queryResult: ApolloQueryResult<any> = await apolloClient.query({
      query: GraphqlQueries.getViaShieldNamesByRpPrimaryKeyQuery(),
      variables: {
        routeId: key.routeId,
        startDate: Moment(key.startDate).format(),
        direction: key.direction,
      },
    })
    const externalViaShieldNames: IExternalViaShieldName[] =
      queryResult.data.get_via_shield_names.nodes
    return externalViaShieldNames.map((extViaShieldName) =>
      ViaNameFactory.parseExternalViaShieldName({
        viaShieldNameId: extViaShieldName.relid,
        externalViaShieldName: extViaShieldName,
      })
    )
  }

  public static fetchViaShieldNameById = async (
    viaShieldNameId: number
  ): Promise<IViaShieldName> => {
    const queryResult: ApolloQueryResult<any> = await apolloClient.query({
      query: GraphqlQueries.getViaShieldNameByIdKeyQuery(),
      variables: {
        relid: viaShieldNameId,
      },
    })
    const extViaShieldName: IExternalViaShieldName | null =
      queryResult.data.viaKilpiNimetByRelid
    return ViaNameFactory.parseExternalViaShieldName({
      viaShieldNameId,
      externalViaShieldName: extViaShieldName,
    })
  }
}

export default ViaNameService
