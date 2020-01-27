import { ApolloQueryResult } from 'apollo-client';
import _ from 'lodash';
import Moment from 'moment';
import EndpointPath from '~/enums/endpointPath';
import LineHeaderFactory from '~/factories/lineHeaderFactory';
import ApolloClient from '~/helpers/ApolloClientHelper';
import ILineHeader from '~/models/ILineHeader';
import IExternalLineHeader from '~/models/externals/IExternalLineHeader';
import { IMassEditLineHeader } from '~/stores/lineHeaderMassEditStore';
import ApiClient from '~/utils/ApiClient';
import { areDatesEqual } from '~/utils/dateHelpers';
import GraphqlQueries from './graphqlQueries';

interface ILineHeaderSaveModel {
    lineId: string;
    added: ILineHeader[];
    edited: ILineHeader[];
    removed: ILineHeader[];
    originals: ILineHeader[];
}

class LineHeaderService {
    /**
     * Returns filtered list of line topic names
     * @param lineId - lineId to used to filter topic names
     * @return filtered list of line topic names sorted by startTime
     */
    public static fetchLineHeaders = async (lineId: string): Promise<ILineHeader[]> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getAllLineHeadersQuery()
        });
        const allExtLineNames: IExternalLineHeader[] = queryResult.data.node.nodes;
        const filteredExtLineNames: IExternalLineHeader[] = allExtLineNames.filter(
            (extLineName: IExternalLineHeader) => extLineName.lintunnus === lineId
        );
        return filteredExtLineNames
            .map((externalLineHeader: IExternalLineHeader) => {
                return LineHeaderFactory.mapExternalLineHeader(externalLineHeader);
            })
            .sort(
                (a: ILineHeader, b: ILineHeader) => a.startDate!.getTime() - b.startDate!.getTime()
            );
    };

    public static fetchLineHeader = async (
        lineId: string,
        startDate: string
    ): Promise<ILineHeader> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getLineHeaderQuery(),
            variables: {
                lineId,
                startDate: Moment(startDate).format()
            }
        });

        return LineHeaderFactory.mapExternalLineHeader(queryResult.data.lineHeader);
    };

    public static massEditLineHeaders = async (
        massEditLineHeaders: IMassEditLineHeader[],
        oldLineHeaders: ILineHeader[],
        lineId: string
    ) => {
        const added: ILineHeader[] = [];
        const edited: ILineHeader[] = [];
        const removed: ILineHeader[] = [];
        const originals: ILineHeader[] = [];
        massEditLineHeaders!.forEach((massEditLineHeader: IMassEditLineHeader) => {
            const currentLineHeader = massEditLineHeader.lineHeader;
            if (massEditLineHeader.isRemoved) {
                removed.push(currentLineHeader);
                return;
            }
            const originalLineHeader = currentLineHeader.originalStartDate
                ? oldLineHeaders.find(oldLineHeader =>
                      areDatesEqual(
                          oldLineHeader.originalStartDate!,
                          currentLineHeader.originalStartDate!
                      )
                  )
                : null;

            if (!originalLineHeader) {
                added.push(massEditLineHeader.lineHeader);
            } else {
                _.isEqual(originalLineHeader, currentLineHeader)
                    ? originals.push(currentLineHeader)
                    : edited.push(currentLineHeader);
            }
        });

        const lineHeaderSaveModel: ILineHeaderSaveModel = {
            lineId,
            added,
            edited,
            removed,
            originals
        };

        await ApiClient.postRequest(EndpointPath.LINE_HEADER_MASS_EDIT, lineHeaderSaveModel);
        ApolloClient.clearStore();
    };
}

export default LineHeaderService;

export { ILineHeaderSaveModel };
