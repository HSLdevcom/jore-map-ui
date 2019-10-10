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
            areaId: node.pysalueid,
            elyNumber: node.elynumero,
            modifiedBy: node.pyskuka,
            modifiedOn: node.pysviimpvm ? new Date(node.pysviimpvm) : undefined,
            municipality: node.pyskunta,
            nameLongFi: node.pysnimipitka,
            nameLongSw: node.pysnimipitkar,
            nameModifiedOn: node.nimiviimpvm ? new Date(node.nimiviimpvm) : undefined,
            nodeId: node.soltunnus,
            placeNameFi: node.pyspaikannimi,
            placeNameSw: node.pyspaikannimir,
            platform: node.pyslaituri,
            postalNumber: node.postinro,
            section: node.vyohyke
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
            areaId: '',
            elyNumber: '',
            modifiedBy: '',
            modifiedOn: new Date(),
            municipality: '',
            nameLongFi: '',
            nameLongSw: '',
            nameModifiedOn: new Date(),
            nodeId: '',
            placeNameFi: '',
            placeNameSw: '',
            platform: '',
            postalNumber: '',
            section: ''
        };
    };
}

export default StopFactory;
