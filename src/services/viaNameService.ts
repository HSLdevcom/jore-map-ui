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
        });
        const externalViaNames: IExternalViaName[] = queryResult.data.get_via_names.nodes;
        return externalViaNames.map((extViaName) => _parseExternalViaName(extViaName));
    };

    public static fetchViaNameById = async (viaNameId: number): Promise<IViaName> => {
        const queryResult: ApolloQueryResult<any> = await apolloClient.query({
            query: GraphqlQueries.getViaNameByIdKeyQuery(),
            variables: {
                relid: viaNameId,
            },
        });
        return _parseExternalViaName(queryResult.data.viaNimetByRelid);
    };

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
        });
        const externalViaShieldNames: IExternalViaShieldName[] =
            queryResult.data.get_via_shield_names.nodes;
        return externalViaShieldNames.map((extViaShieldName) =>
            _parseExternalViaShieldName(extViaShieldName)
        );
    };

    public static fetchViaShieldNameById = async (
        viaShieldNameId: number
    ): Promise<IViaShieldName> => {
        const queryResult: ApolloQueryResult<any> = await apolloClient.query({
            query: GraphqlQueries.getViaShieldNameByIdKeyQuery(),
            variables: {
                relid: viaShieldNameId,
            },
        });
        return _parseExternalViaShieldName(queryResult.data.viaKilpiNimetByRelid);
    };
}

const _parseExternalViaName = (externalViaName: IExternalViaName): IViaName => {
    return {
        viaNameId: `${externalViaName.relid}`,
        destinationFi1: externalViaName.maaranpaa1,
        destinationFi2: externalViaName.maaranpaa2,
        destinationSw1: externalViaName.maaranpaa1R,
        destinationSw2: externalViaName.maaranpaa2R,
    };
};

const _parseExternalViaShieldName = (
    externalViaShieldName: IExternalViaShieldName
): IViaShieldName => {
    return {
        viaShieldNameId: `${externalViaShieldName.relid}`,
        destinationShieldFi: externalViaShieldName.viasuomi,
        destinationShieldSw: externalViaShieldName.viaruotsi,
    };
};

export default ViaNameService;
