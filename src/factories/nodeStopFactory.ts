import IStop from '~/models/IStop';
import IExternalStop  from '~/models/externals/IExternalStop';

class StopFactory {
    public static createStop = (node: IExternalStop): IStop => {
        return {
            id: node.id,
            nameFi: node.pysnimi,
            nameSe: node.pysnimir,
            radius: node.pyssade,
            hastusId: node.paitunnus,
            addressFi: node.pysosoite,
            addressSe: node.pysosoiter,
            areaId: node.pysalueid,
            direction: node.pyssuunta,
            elyNumber: node.elynumero,
            exchangeStop: node.pysvaihtopys,
            kutsuplus: node.kutsuplus,
            kutsuplusPriority: node.kutsuplusprior,
            kutsuplusSection: node.kutsuplusvyo,
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
            rate: node.tariffi,
            roof: node.pyskatos,
            section: node.vyohyke,
            terminal: node.terminaali,
            type: node.pystyyppi,
            courseDirection: node.kulkusuunta,
        };
    }
}

export default StopFactory;
