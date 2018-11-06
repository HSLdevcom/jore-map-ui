import IExternalStop from './IExternalStop';

export default interface IExternalNode {
    geojson?: string;
    geojsonManual: string;
    mittpvm: string;
    externalStop?: IExternalStop;
    solkuka: string;
    soltunnus: string;
    soltyyppi: string;
    solviimpvm: string;
}
