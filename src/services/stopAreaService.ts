import { ApolloQueryResult } from 'apollo-client';
import EndpointPath from '~/enums/endpointPath';
import StopAreaFactory from '~/factories/stopAreaFactory';
import ApolloClient from '~/helpers/ApolloClientHelper';
import IStopArea from '~/models/IStopArea';
import ApiClient from '~/utils/ApiClient';
import GraphqlQueries from './graphqlQueries';

interface ITerminalAreaItem {
    id: string;
    name: string;
}

interface IStopAreaItem {
    pysalueid: string;
    nimi: string;
    nimir: string;
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
        await ApiClient.updateObject(EndpointPath.STOP_AREA, stopArea);
    };

    public static createStopArea = async (stopArea: IStopArea) => {
        const stopAreaId = await ApiClient.createObject(EndpointPath.STOP_AREA, stopArea);
        return stopAreaId;
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
