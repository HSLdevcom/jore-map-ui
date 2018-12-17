import IExternalStop from './IExternalStop';

export default interface IExternalNode {
    pysakkiBySoltunnus?: IExternalStop;
    geojson?: string;
    geojsonManual: string;
    mittpvm: string;
    solkuka: string;
    soltunnus: string;
    sollistunnus: string;
    solkirjain: string;
    soltyyppi: string;
    solviimpvm: string;
}
