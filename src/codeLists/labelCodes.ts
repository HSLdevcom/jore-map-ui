import { ILink } from '~/models';

const getLabel = (model: string, property: string) => {
    switch (model) {
        case 'link':
            return _getLinkLabel(property);
    }
    throw `No label found for model: ${model} property: ${property}`;
};

const _getLinkLabel = (property: string) => {
    type LinkKeys = keyof ILink;
    type ILinkLabelModel = { [key in LinkKeys]: string };
    const linkLabelModel: ILinkLabelModel = {
        transitType: 'TYYPPI',
        startNode: 'ALKUSOLMU',
        endNode: 'LOPPUSOLMU',
        geometry: 'GEOMETRIA',
        municipalityCode: 'KUNTA',
        streetName: 'KATU',
        length: 'PITUUS',
        measuredLength: 'LASKETTU PITUUS (m)',
        modifiedBy: 'MUOKANNUT',
        modifiedOn: 'MUOKATTU PVM'
    };
    return linkLabelModel[property];
};

export { getLabel };
