import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '~/util/ApolloClient';
import GraphqlQueries from './graphqlQueries';

interface IExternalLineTopic {
    lintunnus: string;
    linnimi: string;
    linalkupvm: string;
    linloppupvm: string;
}

interface ILineTopic {
    lineId: string;
    lineName: string;
    lineStartTime: Date;
    lineEndTime: Date;
}

class LineNameService {
    /**
     * Returns filtered list of line topic names
     * @param lineId - lineId to used to filter topic names
     * @return filtered list of line topic names sorted by startTime
     */
    public static fetchLineTopicsForLineId = async (
        lineId: string
    ): Promise<ILineTopic[]> => {
        const queryResult: ApolloQueryResult<any> = await apolloClient.query({
            query: GraphqlQueries.getAllLineTopics()
        });
        const allExtLineNames: IExternalLineTopic[] =
            queryResult.data.node.nodes;
        const filteredExtLineNames: IExternalLineTopic[] = allExtLineNames.filter(
            (extLineName: IExternalLineTopic) =>
                extLineName.lintunnus === lineId
        );
        return filteredExtLineNames
            .map((extLineName: IExternalLineTopic) => {
                return {
                    lineId: extLineName.lintunnus,
                    lineName: extLineName.linnimi,
                    lineStartTime: new Date(extLineName.linalkupvm),
                    lineEndTime: new Date(extLineName.linloppupvm)
                };
            })
            .sort(
                (a: ILineTopic, b: ILineTopic) =>
                    a.lineStartTime.getTime() - b.lineStartTime.getTime()
            );
    };
}

export default LineNameService;

export { ILineTopic };
