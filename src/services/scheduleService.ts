import { ApolloQueryResult } from 'apollo-client';
import ApolloClient from '~/helpers/ApolloClient';
import ISchedule from '~/models/ISchedule';
import IExternalSchedule from '~/models/externals/IExternalSchedule';
import { toMidnightDate } from '~/utils/dateUtils';
import graphqlQueries from './graphqlQueries';

class ScheduleService {
    public static fetchActiveSchedules = async (routeId: string): Promise<ISchedule[]> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: graphqlQueries.getAllSchedulesQuery(),
            variables: {
                routeId,
            },
        });
        const currentDate = toMidnightDate(new Date());
        const activeSchedules: ISchedule[] = queryResult.data.allAikataulus.nodes
            .filter((extSchedule: IExternalSchedule) => extSchedule.reitunnus === routeId)
            .map((extSchedule: IExternalSchedule) => {
                return {
                    routeId: extSchedule.reitunnus,
                    startDate: extSchedule.lavoimast,
                    endDate: extSchedule.laviimvoi,
                    modifiedBy: extSchedule.lakuka,
                    modifiedOn: extSchedule.laviimpvm,
                };
            })
            .filter((schedule: ISchedule) => {
                return new Date(schedule.endDate).getTime() >= currentDate.getTime();
            });

        return activeSchedules;
    };
}

export default ScheduleService;
