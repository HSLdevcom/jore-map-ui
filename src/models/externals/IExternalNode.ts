import IExternalStop from './IExternalStop';

export default interface IExternalNode {
    soltunnus: string;
    soltyyppi: string;
    sollistunnus: string;
    solmapiste?: string;
    solx: number;
    soly: number;
    solkuka?: string;
    solviimpvm?: string;
    solstx: number;
    solsty: number;
    solkirjain?: string;
    solhis?: string;
    solomx: number;
    solomy: number;
    solotapa?: string;
    mittpvm?: string;
    mkjmx?: number;
    mkjmy?: number;
    pysakkiBySoltunnus?: IExternalStop;
    geojson?: string;
    transittypes: string;
    geojsonManual: string;
    geojsonProjection: string;
}
