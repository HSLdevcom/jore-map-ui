import { INode } from '.';

export default interface IRoutePath {
    routeId: string;
    nodes: INode[];
    routePathName: string;
    direction: string;
    positions: [[number, number]];
    geoJson: any;
    visible: boolean;
    startTime: Date;
    endTime: Date;
    lastModified: Date;
}
