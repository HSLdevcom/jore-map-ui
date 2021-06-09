export default interface IExternalStop {
    soltunnus: string;
    pyskunta: string;
    pysnimi: string;
    pysnimir: string;
    pyspaikannimi?: string;
    pyspaikannimir?: string;
    pysosoite: string;
    pysosoiter: string;
    pysvaihtopys: string;
    pyskuka?: string;
    pysviimpvm?: Date;
    pyslaituri?: string;
    pystyyppi: string;
    pyssade: number;
    pyssuunta: string;
    paitunnus?: string;
    terminaali: string;
    kutsuplus: string;
    kutsuplusvyo: string;
    kulkusuunta: string;
    kutsuplusprior: string;
    id: number;
    pysalueid?: string;
    tariffi: string;
    elynumero: string;
    pysnimipitka?: string;
    pysnimipitkar?: string;
    vyohyke: string;
    postinro?: string;
}

interface IExternalStopItem {
    pysalueid: string;
    soltunnus: string;
    pysnimi: string;
    pysnimir: string;
}

export { IExternalStopItem };
