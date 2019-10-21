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

class StopService {
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

    public static fetchAvailableShortIds = async (shortIdLetter?: string): Promise<string[]> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getReservedShortIds(),
            variables: {
                shortIdLetter
            }
        });
        const reservedShortIds = _.chain(queryResult.data.getReservedShortIds.nodes)
            .filter(node => node !== null)
            .map((node: IExternalNode) => node.sollistunnus)
            .uniq()
            .value();
        const allNumberVariations = _generateAllNumberVariations(4);
        return allNumberVariations.filter(num => !reservedShortIds.includes(num));
    };
}

/**
 * @param numberCount - e.g. with numberCount 4, generates ["0000", "0001", "0002", ..., "9998", "9999"]
 **/
const _generateAllNumberVariations = (numberCount: number) => {
    const allNumbers: string[] = [];
    let max = '';
    for (let i = 0; i < numberCount; i += 1) {
        max += '9';
    }
    for (let i = 0; i <= parseInt(max, 10); i += 1) {
        const current = String(i);
        const missingZeroCount = numberCount - current.length;
        const missingZeros = '0'.repeat(missingZeroCount);
        allNumbers.push(missingZeros + current);
    }
    return allNumbers;
};

export default StopService;

export { IStopAreaItem, IStopSectionItem };
