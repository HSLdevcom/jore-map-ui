import { ApolloQueryResult } from 'apollo-client';
import _ from 'lodash';
import EndpointPath from '~/enums/endpointPath';
import NodeStopFactory from '~/factories/nodeStopFactory';
import ApolloClient from '~/helpers/ApolloClient';
import IHastusArea, { IHastusAreaSaveModel } from '~/models/IHastusArea';
import IStop, { IStopItem } from '~/models/IStop';
import IExternalHastusArea from '~/models/externals/IExternalHastusArea';
import IExternalNode from '~/models/externals/IExternalNode';
import IExternalStop, { IExternalStopItem } from '~/models/externals/IExternalStop';
import HttpUtils from '~/utils/HttpUtils';
import GraphqlQueries from './graphqlQueries';
import NodeService from './nodeService';

// TODO: move into /models
interface IStopSectionItem {
    selite: string;
}

interface IReservedShortIdItem {
    nodeId: string;
    shortId: string;
}

const SHORT_ID_LENGTH = 4;

class StopService {
    public static fetchAllStops = async (): Promise<IStop[]> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getAllStopsQuery(),
            fetchPolicy: 'no-cache',
        });
        const externalStops: IExternalStop[] = queryResult.data.node.nodes;
        return externalStops.map(
            (externalStop: IExternalStop): IStop => {
                return NodeStopFactory.mapExternalStop(externalStop);
            }
        );
    };

    public static fetchAllStopSections = async (): Promise<IStopSectionItem[]> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getAllStopSections(),
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
                fetchPolicy: 'no-cache', // no-cache is needed because otherwise nested data fetch does not always work
            },
        });
        const reservedShortIds: IReservedShortIdItem[] = _.chain(
            queryResult.data.getReservedShortIds.nodes
        )
            .filter((node) => node !== null)
            .map((node: IExternalNode) => {
                return {
                    nodeId: node.soltunnus,
                    shortId: node.sollistunnus,
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
            query: GraphqlQueries.getAllStopItems(),
        });

        const map = new Map();

        const stopItems: IStopItem[] = _.chain(queryResult.data.node.nodes)
            .filter((iterator: IExternalStopItem) => iterator.pysalueid === stopAreaId)
            .map((iterator: IExternalStopItem) => {
                return {
                    stopAreaId: iterator.pysalueid,
                    nodeId: iterator.soltunnus,
                    nameFi: iterator.pysnimi,
                    nameSw: iterator.pysnimir,
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
        map.forEach((iterator) => {
            result.push(iterator);
        });

        return result;
    };

    public static fetchAllHastusAreas = async (): Promise<IHastusArea[]> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getAllHastusAreas(),
            fetchPolicy: 'no-cache',
        });
        const externalHastusAreas: IExternalHastusArea[] = queryResult.data.node.nodes;

        return externalHastusAreas.map(
            (ha: IExternalHastusArea): IHastusArea => {
                return {
                    id: ha.paitunnus,
                    name: ha.nimi,
                };
            }
        );
    };

    public static createHastusArea = async (hastusAreaSaveModel: IHastusAreaSaveModel) => {
        await HttpUtils.createObject(EndpointPath.HASTUS_AREA, hastusAreaSaveModel);
    };

    public static updateHastusArea = async (hastusAreaSaveModel: IHastusAreaSaveModel) => {
        await HttpUtils.updateObject(EndpointPath.HASTUS_AREA, hastusAreaSaveModel);
    };

    public static fetchRiseCount = async ({ nodeId }: { nodeId: string }): Promise<number> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getArmamentInfoQuery(),
            variables: { nodeId },
        });
        return queryResult && queryResult.data && queryResult.data.node
            ? queryResult.data.node.nousijat
            : 0;
    };
}

const _getAvailableShortIds = (
    reservedShortIdItems: IReservedShortIdItem[],
    currentNodeId: string
): string[] => {
    const allShortIdVariations = _generateAllShortIdVariations(SHORT_ID_LENGTH);
    return allShortIdVariations.filter(
        (shortIdVariation) =>
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
