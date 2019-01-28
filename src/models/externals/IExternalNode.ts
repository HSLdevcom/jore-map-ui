import IExternalStop from './IExternalStop';

export default interface IExternalNode {
    pysakkiBySoltunnus?: IExternalStop;
    geojson?: string;
    transittypes: string;
    geojsonManual: string;
    geojsonProjection: string;
    mittpvm: string;
    solkuka: string;
    soltunnus: string;
    sollistunnus: string;
    solkirjain: string;
    soltyyppi: string;
    solviimpvm: string;
}
