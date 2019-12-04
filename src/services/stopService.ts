import { ApolloQueryResult } from 'apollo-client';
import _ from 'lodash';
import { IStopItem } from '~/models/IStop';
import IExternalNode from '~/models/externals/IExternalNode';
import { IExternalStopItem } from '~/models/externals/IExternalStop';
import ApolloClient from '~/util/ApolloClient';
import GraphqlQueries from './graphqlQueries';

interface IStopSectionItem {
    selite: string;
}

interface IReservedShortIdItem {
    nodeId: string;
    shortId: string;
}

const SHORT_ID_LENGTH = 4;

class StopService {
    public static fetchAllStopSections = async (): Promise<IStopSectionItem[]> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getAllStopSections()
        });

        return queryResult.data.node.nodes;
    };

    public static fetchAvailableShortIds = async (
        currentNodeId: string,
        shortIdLetter?: string
    ): Promise<string[]> => {
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
        const availableShortIds: string[] = _getAvailableShortIds(reservedShortIds, currentNodeId);
        return availableShortIds;
    };

    public static fetchAllStops = async (): Promise<IStopItem[]> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getAllStops()
        });

        return queryResult.data.node.nodes.map((externalStopItem: IExternalStopItem) => {
            return {
                stopAreaId: externalStopItem.pysalueid,
                nodeId: externalStopItem.soltunnus,
                nameFi: externalStopItem.pysnimi,
                nameSw: externalStopItem.pysnimir
            };
        });
    };
}

const _getAvailableShortIds = (
    reservedShortIdItems: IReservedShortIdItem[],
    currentNodeId: string
): string[] => {
    const allShortIdVariations = _generateAllShortIdVariations(SHORT_ID_LENGTH);
    return allShortIdVariations.filter(
        shortIdVariation =>
            !reservedShortIdItems.find((reservedShortIdItem: IReservedShortIdItem) => {
                return (
                    reservedShortIdItem.shortId === shortIdVariation &&
                    // Prevent currently opened node to affect available ids
                    reservedShortIdItem.nodeId !== currentNodeId
                );
            })
    );
};

/**
 * @param numberCount - e.g. with numberCount 4, generates ["0000", "0001", "0002", ..., "9998", "9999"]
 **/
const _generateAllShortIdVariations = (numberCount: number) => {
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

export { IStopSectionItem, IStopItem };
