import { INode } from '.';

export default interface IRoutePath {
    nodes: INode[];
    routePathName: string;
    direction: string;
    positions: [[number, number]];
    visible: boolean;
    startTime: Date;
    endTime: Date;
    lastModified: Date;
}
