import IStop from '~/models/IStop';
import IExternalStop from '~/models/externals/IExternalStop';

class StopFactory {
    public static mapExternalStop = (node: IExternalStop): IStop => {
        return {
            nameFi: node.pysnimi,
            nameSw: node.pysnimir,
            radius: node.pyssade,
            hastusId: node.paitunnus,
            addressFi: node.pysosoite,
            addressSw: node.pysosoiter,
            stopAreaId: node.pysalueid,
            tariffi: node.tariffi,
            elyNumber: node.elynumero,
            modifiedBy: node.pyskuka,
            modifiedOn: node.pysviimpvm ? new Date(node.pysviimpvm) : undefined,
            municipality: node.pyskunta,
            nameLongFi: node.pysnimipitka,
            nameLongSw: node.pysnimipitkar,
            nodeId: node.soltunnus,
            placeNameFi: node.pyspaikannimi,
            placeNameSw: node.pyspaikannimir,
            platform: node.pyslaituri,
            postalNumber: node.postinro,
            section: node.vyohyke,
        };
    };

    public static createNewStop = (): IStop => {
        return {
            nameFi: '',
            nameSw: '',
            radius: 10,
            hastusId: '',
            addressFi: '',
            addressSw: '',
            stopAreaId: '',
            tariffi: '',
            elyNumber: '',
            modifiedBy: '',
            modifiedOn: new Date(),
            municipality: '',
            nameLongFi: '',
            nameLongSw: '',
            nodeId: '',
            placeNameFi: '',
            placeNameSw: '',
            platform: '',
            postalNumber: '',
            section: '',
        };
    };
}

export default StopFactory;
