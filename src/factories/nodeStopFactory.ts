import IStop from '~/models/IStop';
import IExternalStop from '~/models/externals/IExternalStop';

class StopFactory {
    public static mapExternalStop = (node: IExternalStop): IStop => {
        return {
            nameFi: node.pysnimi,
            nameSe: node.pysnimir,
            radius: node.pyssade,
            hastusId: node.paitunnus,
            addressFi: node.pysosoite,
            addressSe: node.pysosoiter,
            areaId: node.pysalueid,
            elyNumber: node.elynumero,
            modifiedBy: node.pyskuka,
            modifiedOn: new Date(node.pysviimpvm),
            municipality: node.pyskunta,
            nameLongFi: node.pysnimipitka,
            nameLongSe: node.pysnimipitkar,
            nameModifiedOn: new Date(node.nimiviimpvm),
            nodeId: node.soltunnus,
            placeNameFi: node.pyspaikannimi,
            placeNameSe: node.pyspaikannimir,
            platform: node.pyslaituri,
            postalNumber: node.postinro,
            section: node.vyohyke
        };
    };

    public static createNewStop = (): IStop => {
        return {
            nameFi: '',
            nameSe: '',
            radius: 10,
            hastusId: '',
            addressFi: '',
            addressSe: '',
            areaId: '',
            elyNumber: '',
            modifiedBy: '',
            modifiedOn: new Date(),
            municipality: '',
            nameLongFi: '',
            nameLongSe: '',
            nameModifiedOn: new Date(),
            nodeId: '',
            placeNameFi: '',
            placeNameSe: '',
            platform: '',
            postalNumber: '',
            section: ''
        };
    };
}

export default StopFactory;
