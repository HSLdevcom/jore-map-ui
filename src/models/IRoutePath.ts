export default interface IRoutePath {
    routePathName: string;
    direction: string;
    geoJson: string;
    visible: boolean;
    startTime: Date;
    endTime: Date;
    lastModified: Date;
}
