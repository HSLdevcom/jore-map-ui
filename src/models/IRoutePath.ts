import { INode } from '.';

export default interface IRoutePath {
    nodes: INode[];
    routePathName: string;
    direction: string;
    geoJson: any;
    visible: boolean;
    startTime: Date;
    endTime: Date;
    lastModified: Date;
}
