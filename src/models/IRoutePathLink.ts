export default interface IRoutePathLink {
    id: string;
    positions: [[number, number]];
    startNodeId: string;
    endNodeId: string;
    orderNumber: number;
    relPysakki: string;
}
