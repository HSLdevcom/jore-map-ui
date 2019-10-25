import TransitType from '~/enums/transitType';

export default interface IExternalStopArea {
    pysalueid: string;
    verkko: TransitType;
    nimi: string;
    nimir: string;
    termid: string;
    tallpvm: Date;
    tallentaja: string;
    pysakkialueryhma: string;
}
