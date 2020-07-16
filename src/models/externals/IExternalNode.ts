import IExternalStop from './IExternalStop';

interface IExternalNode {
    soltunnus: string;
    soltyyppi: string;
    sollistunnus: string;
    solkuka?: string;
    solviimpvm?: Date;
    solkirjain?: string;
    solhis?: string;
    solotapa?: string;
    mittpvm?: Date;
    pysakkiBySoltunnus?: IExternalStop;
    transitTypes: string;
    geojson?: string;
    geojsonManual: string;
    geojsonProjection: string;
    dateRanges?: string;
}

interface IExternalSearchNode {
    soltunnus: string;
    soltyyppi: string;
    sollistunnus: string;
    solkirjain?: string;
    pysakkiBySoltunnus?: IExternalSearchStop;
    transitTypes: string;
    geojson?: string;
    geojsonManual: string;
    dateRanges?: string;
}

interface IExternalSearchStop {
    soltunnus: string;
    pysnimi: string;
}

export default IExternalNode;

export { IExternalSearchNode };
