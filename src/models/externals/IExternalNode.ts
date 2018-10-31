import IExternalNodeStop from './IExternalNodeStop';

export default interface IExternalNode {
    geojson?: string;
    geojsonManual: string;
    mittpvm: string;
    pysakkiBySoltunnus: IExternalNodeStop;
    solkuka: string;
    soltunnus: string;
    soltyyppi: string;
    solviimpvm: string;
}
