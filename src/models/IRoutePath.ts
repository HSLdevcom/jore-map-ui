export default interface IRoutePath {
    routePathName: string;
    direction: string;
    geoJson: any;
    visible: boolean;
    startTime: Date;
    endTime: Date;
    lastModified: Date;
}
