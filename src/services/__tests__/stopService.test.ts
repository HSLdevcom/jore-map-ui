import { mocked } from 'ts-jest/utils';
import ApolloClient from '~/helpers/ApolloClient';
import StopService from '../stopService';

jest.mock('../../helpers/ApolloClient');

const mockedApolloClient = mocked(ApolloClient, true) as any;

// These tests expect that StopService.SHORT_ID_LENGTH = 4

describe('StopService.fetchAvailableShortIds', () => {
    it('Works without letting currentNode affect reservedShortIds if no nodeId match found', async () => {
        const queryReturnValue = {
            data: {
                getReservedShortIds: {
                    nodes: [
                        {
                            soltunnus: '1',
                            sollistunnus: '0001',
                        },
                        {
                            soltunnus: '2',
                            sollistunnus: '0002',
                        },
                    ],
                },
            },
        };
        mockedApolloClient.query = jest.fn(async (options: any) => queryReturnValue);
        const currentNodeId = '3';

        const availableIds = await StopService.fetchAvailableShortIds(currentNodeId);
        expect(availableIds.includes('0000')).toEqual(true);
        expect(availableIds.includes('0001')).toEqual(false);
        expect(availableIds.includes('0002')).toEqual(false);
        expect(availableIds.includes('0003')).toEqual(true);
    });

    it('Removes shortId of the currentNode from availableIds', async () => {
        const queryReturnValue = {
            data: {
                getReservedShortIds: {
                    nodes: [
                        {
                            soltunnus: '1',
                            sollistunnus: '0001',
                        },
                        {
                            soltunnus: '2',
                            sollistunnus: '0002',
                        },
                    ],
                },
            },
        };
        mockedApolloClient.query = jest.fn(async (options: any) => queryReturnValue);
        const currentNodeId = '1';

        const availableIds = await StopService.fetchAvailableShortIds(currentNodeId);
        expect(availableIds.includes('0000')).toEqual(true);
        expect(availableIds.includes('0001')).toEqual(true);
        expect(availableIds.includes('0002')).toEqual(false);
        expect(availableIds.includes('0003')).toEqual(true);
    });

    it('Doesnt remove shortId of the currentNode from availableIds if more than 2 shortIds match shortId of the currentNode', async () => {
        const queryReturnValue = {
            data: {
                getReservedShortIds: {
                    nodes: [
                        {
                            soltunnus: '1',
                            sollistunnus: '0001',
                        },
                        {
                            soltunnus: '2',
                            sollistunnus: '0001',
                        },
                        {
                            soltunnus: '3',
                            sollistunnus: '0002',
                        },
                    ],
                },
            },
        };
        mockedApolloClient.query = jest.fn(async (options: any) => queryReturnValue);
        const currentNodeId = '1';

        const availableIds = await StopService.fetchAvailableShortIds(currentNodeId);
        expect(availableIds.includes('0000')).toEqual(true);
        expect(availableIds.includes('0001')).toEqual(false);
        expect(availableIds.includes('0002')).toEqual(false);
        expect(availableIds.includes('0003')).toEqual(true);
    });
});
