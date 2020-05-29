import { ApolloQueryResult } from 'apollo-client';
import Moment from 'moment';
import apolloClient from '~/helpers/ApolloClient';
import { IViaName } from '~/models';
import { IRoutePathPrimaryKey } from '~/models/IRoutePath';
import IViaShieldName from '~/models/IViaShieldName';
import IExternalViaName from '~/models/externals/IExternalViaName';
import IExternalViaShieldName from '~/models/externals/IExternalViaShieldName';
import GraphqlQueries from './graphqlQueries';

class ViaNameService {
    public static fetchViaName = async (key: IRoutePathPrimaryKey): Promise<IViaName[]> => {
        const queryResult: ApolloQueryResult<any> = await apolloClient.query({
            query: GraphqlQueries.getViaNameQuery(),
            variables: {
                routeId: key.routeId,
                startDate: Moment(key.startDate).format(),
                direction: key.direction,
            },
        });

        const externalViaNames: IExternalViaName[] = queryResult.data.get_via_names.nodes;
        return externalViaNames.map(
            (externalViaName: IExternalViaName): IViaName => {
                return {
                    viaNameId: `${externalViaName.relid}`,
                    destinationFi1: externalViaName.maaranpaa1,
                    destinationFi2: externalViaName.maaranpaa2,
                    destinationSw1: externalViaName.maaranpaa1R,
                    destinationSw2: externalViaName.maaranpaa2R,
                };
            }
        );
    };

    public static fetchViaShieldName = async (
        key: IRoutePathPrimaryKey
    ): Promise<IViaShieldName[]> => {
        const queryResult: ApolloQueryResult<any> = await apolloClient.query({
            query: GraphqlQueries.getViaShieldNameQuery(),
            variables: {
                routeId: key.routeId,
                startDate: Moment(key.startDate).format(),
                direction: key.direction,
            },
        });

        const externalViaShieldNames: IExternalViaShieldName[] =
            queryResult.data.get_via_shield_names.nodes;
        return externalViaShieldNames.map(
            (externalViaShieldName: IExternalViaShieldName): IViaShieldName => {
                return {
                    viaShieldNameId: `${externalViaShieldName.relid}`,
                    destinationShieldFi: externalViaShieldName.viasuomi,
                    destinationShieldSw: externalViaShieldName.viaruotsi,
                };
            }
        );
    };
}

export default ViaNameService;
