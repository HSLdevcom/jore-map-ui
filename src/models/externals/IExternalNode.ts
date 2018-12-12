import IExternalStop from './IExternalStop';

export default interface IExternalNode {
    pysakkiBySoltunnus?: IExternalStop;
    geojson?: string;
    geojsonManual: string;
    mittpvm: string;
    solkuka: string;
    soltunnus: string;
    soltyyppi: string;
    solviimpvm: string;
}
