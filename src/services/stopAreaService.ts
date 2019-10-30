import { ApolloQueryResult } from 'apollo-client';
import endpoints from '~/enums/endpoints';
import StopAreaFactory from '~/factories/stopAreaFactory';
import IStopArea from '~/models/IStopArea';
import ApiClient from '~/util/ApiClient';
import ApolloClient from '~/util/ApolloClient';
import GraphqlQueries from './graphqlQueries';

interface ITerminalAreaItem {
    id: string;
    name: string;
}

interface IStopAreaItem {
    pysalueid: string;
    nimi: string;
}

interface IExternalTerminalArea {
    termid: string;
    nimi: string;
}

class StopAreaService {
    public static fetchStopArea = async (stopAreaId: string): Promise<IStopArea> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getStopAreaQuery(),
            variables: { stopAreaId }
        });
        return StopAreaFactory.mapExternalStopArea(queryResult.data.stopArea);
    };

    public static fetchAllStopAreas = async (): Promise<IStopAreaItem[]> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getAllStopAreas()
        });

        return queryResult.data.node.nodes;
    };

    public static updateStopArea = async (stopArea: IStopArea) => {
        await ApiClient.updateObject(endpoints.STOP_AREA, stopArea);
    };

    public static createStopArea = async (stopArea: IStopArea) => {
        await ApiClient.createObject(endpoints.STOP_AREA, stopArea);
    };

    public static fetchAllTerminalAreas = async (): Promise<ITerminalAreaItem[]> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getAllTerminalAreas()
        });

        const terminalAreaItems: ITerminalAreaItem[] = queryResult.data.node.nodes.map(
            (externalTerminalArea: IExternalTerminalArea) => {
                return {
                    id: externalTerminalArea.termid,
                    name: externalTerminalArea.nimi
                };
            }
        );

        return terminalAreaItems;
    };
}

export default StopAreaService;

export { IStopAreaItem, ITerminalAreaItem };
