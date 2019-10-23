import { ApolloQueryResult } from 'apollo-client';
import _ from 'lodash';
import IExternalNode from '~/models/externals/IExternalNode';
import ApolloClient from '~/util/ApolloClient';
import GraphqlQueries from './graphqlQueries';

interface IStopAreaItem {
    pysalueid: string;
    nimi: string;
}

interface IStopSectionItem {
    selite: string;
}

interface IReservedShortIdItem {
    nodeId: string;
    shortId: string;
}

class StopService {
    // Expose function for testing
    public static fetchAllStopAreas = async (): Promise<IStopAreaItem[]> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getAllStopAreas()
        });

        return queryResult.data.node.nodes;
    };

    public static fetchAllStopSections = async (): Promise<IStopSectionItem[]> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getAllStopSections()
        });

        return queryResult.data.node.nodes;
    };

    public static fetchReservedShortIds = async (
        shortIdLetter?: string
    ): Promise<IReservedShortIdItem[]> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getReservedShortIds(),
            variables: {
                shortIdLetter,
                fetchPolicy: 'no-cache' // no-cache is needed because otherwise nested data fetch does not always work
            }
        });
        const reservedShortIds: IReservedShortIdItem[] = _.chain(
            queryResult.data.getReservedShortIds.nodes
        )
            .filter(node => node !== null)
            .map((node: IExternalNode) => {
                return {
                    nodeId: node.soltunnus,
                    shortId: node.sollistunnus
                };
            })
            .value();
        return reservedShortIds;
    };
}

export default StopService;

export { IStopAreaItem, IStopSectionItem, IReservedShortIdItem };
