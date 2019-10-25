import { ApolloQueryResult } from 'apollo-client';
import endpoints from '~/enums/endpoints';
import StopAreaFactory from '~/factories/stopAreaFactory';
import IStopArea from '~/models/IStopArea';
import ApiClient from '~/util/ApiClient';
import ApolloClient from '~/util/ApolloClient';
import GraphqlQueries from './graphqlQueries';

class StopAreaService {
    public static fetchStopArea = async (stopAreaId: string): Promise<IStopArea> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getStopAreaQuery(),
            variables: { stopAreaId }
        });
        return StopAreaFactory.mapExternalStopArea(queryResult.data.stopArea);
    };

    public static updateStopArea = async (stopArea: IStopArea) => {
        await ApiClient.updateObject(endpoints.LINK, stopArea);
    };

    public static createStopArea = async (stopArea: IStopArea) => {
        await ApiClient.createObject(endpoints.LINK, stopArea);
    };
}

export default StopAreaService;
