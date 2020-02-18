import { ApolloQueryResult } from 'apollo-client';
import _ from 'lodash';
import EndpointPath from '~/enums/endpointPath';
import ApolloClient from '~/helpers/ApolloClient';
import IHastusArea from '~/models/IHastusArea';
import { IStopItem } from '~/models/IStop';
import IExternalNode from '~/models/externals/IExternalNode';
import { IExternalStopItem } from '~/models/externals/IExternalStop';
import HttpUtils from '~/utils/HttpUtils';
import GraphqlQueries from './graphqlQueries';
import NodeService from './nodeService';

interface IStopSectionItem {
    selite: string;
}

interface IHastusAreaItem {
    paitunnus: string;
    nimi: string;
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

    public static fetchAllHastusAreas = async (): Promise<IHastusAreaItem[]> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getAllHastusAreas()
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

    public static fetchAllStopItemsByStopAreaId = async (
        stopAreaId: string
    ): Promise<IStopItem[]> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getAllStopItems()
        });

        const map = new Map();

        const stopItems: IStopItem[] = _.chain(queryResult.data.node.nodes)
            .filter((iterator: IExternalStopItem) => iterator.pysalueid === stopAreaId)
            .map((iterator: IExternalStopItem) => {
                return {
                    stopAreaId: iterator.pysalueid,
                    nodeId: iterator.soltunnus,
                    nameFi: iterator.pysnimi,
                    nameSw: iterator.pysnimir
                };
            })
            .value();

        const promises: Promise<void>[] = [];
        stopItems.forEach((iterator: IStopItem) => {
            const promise = async () => {
                const node = await NodeService.fetchNode(iterator.nodeId);
                iterator.coordinates = node!.coordinates;
                map.set(iterator.nodeId, iterator);
            };
            promises.push(promise());
        });

        await Promise.all(promises);

        const result: IStopItem[] = [];
        map.forEach(iterator => {
            result.push(iterator);
        });

        return result;
    };

    public static createHastusArea = async (hastusArea: IHastusArea) => {
        await HttpUtils.createObject(EndpointPath.HASTUS_AREA, hastusArea);
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

export { IStopSectionItem, IStopItem, IHastusAreaItem };
