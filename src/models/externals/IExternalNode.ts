import IExternalStop from './IExternalStop';

export default interface IExternalNode {
    soltunnus: string;
    soltyyppi: string;
    sollistunnus: string;
    solmapiste?: string;
    solkuka?: string;
    solviimpvm?: Date;
    solkirjain?: string;
    solhis?: string;
    solotapa?: string;
    mittpvm?: Date;
    pysakkiBySoltunnus?: IExternalStop;
    transittypes: string;
    geojson?: string;
    geojsonManual: string;
    geojsonProjection: string;
}
