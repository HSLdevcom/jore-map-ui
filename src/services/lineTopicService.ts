import { ApolloQueryResult } from 'apollo-client';
import Moment from 'moment';
import ApiClient from '~/util/ApiClient';
import apolloClient from '~/util/ApolloClient';
import endpoints from '~/enums/endpoints';
import ILineTopic from '~/models/ILineTopic';
import IExternalLineTopic from '~/models/externals/IExternalLineTopic';
import LineTopicFactory from '~/factories/lineTopicFactory';
import GraphqlQueries from './graphqlQueries';

class LineTopicService {
    /**
     * Returns filtered list of line topic names
     * @param lineId - lineId to used to filter topic names
     * @return filtered list of line topic names sorted by startTime
     */
    public static fetchLineTopics = async (
        lineId: string
    ): Promise<ILineTopic[]> => {
        const queryResult: ApolloQueryResult<any> = await apolloClient.query({
            query: GraphqlQueries.getAllLineTopicsQuery()
        });
        const allExtLineNames: IExternalLineTopic[] =
            queryResult.data.node.nodes;
        const filteredExtLineNames: IExternalLineTopic[] = allExtLineNames.filter(
            (extLineName: IExternalLineTopic) =>
                extLineName.lintunnus === lineId
        );
        return filteredExtLineNames
            .map((externalLineTopic: IExternalLineTopic) => {
                return LineTopicFactory.mapExternalLineTopic(externalLineTopic);
            })
            .sort(
                (a: ILineTopic, b: ILineTopic) =>
                    a.startDate!.getTime() - b.startDate!.getTime()
            );
    };

    public static fetchLineTopic = async (
        lineId: string,
        startDate: string
    ): Promise<ILineTopic> => {
        const queryResult: ApolloQueryResult<any> = await apolloClient.query({
            query: GraphqlQueries.getLineTopicQuery(),
            variables: {
                lineId,
                startDate: Moment(startDate).format()
            }
        });

        return LineTopicFactory.mapExternalLineTopic(
            queryResult.data.lineTopic
        );
    };

    public static updateLineTopic = async (lineTopic: ILineTopic) => {
        await ApiClient.updateObject(endpoints.LINE_TOPIC, lineTopic);
        await apolloClient.clearStore();
    };

    public static createLineTopic = async (lineTopic: ILineTopic) => {
        const newLineTopic = {
            ...lineTopic,
            originalStartDate: lineTopic.startDate
        };
        const response = await ApiClient.createObject(
            endpoints.LINE_TOPIC,
            newLineTopic
        );
        await apolloClient.clearStore();
        return response.id;
    };
}

export default LineTopicService;
