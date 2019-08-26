import { ApolloQueryResult } from 'apollo-client';
import Moment from 'moment';
import ApiClient from '~/util/ApiClient';
import apolloClient from '~/util/ApolloClient';
import endpoints from '~/enums/endpoints';
import ILineHeader from '~/models/ILineHeader';
import IExternalLineHeader from '~/models/externals/IExternalLineHeader';
import LineHeaderFactory from '~/factories/lineHeaderFactory';
import GraphqlQueries from './graphqlQueries';

class LineHeaderService {
    /**
     * Returns filtered list of line topic names
     * @param lineId - lineId to used to filter topic names
     * @return filtered list of line topic names sorted by startTime
     */
    public static fetchLineHeaders = async (
        lineId: string
    ): Promise<ILineHeader[]> => {
        const queryResult: ApolloQueryResult<any> = await apolloClient.query({
            query: GraphqlQueries.getAllLineHeadersQuery()
        });
        const allExtLineNames: IExternalLineHeader[] =
            queryResult.data.node.nodes;
        const filteredExtLineNames: IExternalLineHeader[] = allExtLineNames.filter(
            (extLineName: IExternalLineHeader) =>
                extLineName.lintunnus === lineId
        );
        return filteredExtLineNames
            .map((externalLineHeader: IExternalLineHeader) => {
                return LineHeaderFactory.mapExternalLineHeader(
                    externalLineHeader
                );
            })
            .sort(
                (a: ILineHeader, b: ILineHeader) =>
                    a.startDate!.getTime() - b.startDate!.getTime()
            );
    };

    public static fetchLineHeader = async (
        lineId: string,
        startDate: string
    ): Promise<ILineHeader> => {
        const queryResult: ApolloQueryResult<any> = await apolloClient.query({
            query: GraphqlQueries.getLineHeaderQuery(),
            variables: {
                lineId,
                startDate: Moment(startDate).format()
            }
        });

        return LineHeaderFactory.mapExternalLineHeader(
            queryResult.data.lineHeader
        );
    };

    public static updateLineHeader = async (lineHeader: ILineHeader) => {
        await ApiClient.updateObject(endpoints.LINE_HEADER, lineHeader);
        await apolloClient.clearStore();
    };

    public static createLineHeader = async (lineHeader: ILineHeader) => {
        const newLineHeader = {
            ...lineHeader,
            originalStartDate: lineHeader.startDate
        };
        const response = await ApiClient.createObject(
            endpoints.LINE_HEADER,
            newLineHeader
        );
        await apolloClient.clearStore();
        return response.id;
    };
}

export default LineHeaderService;
