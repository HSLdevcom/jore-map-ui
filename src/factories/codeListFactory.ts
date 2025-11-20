import ICodeListItem from '~/models/ICodeListItem';
import IExternalCodeListItem from '~/models/externals/IExternalCodeListItem';

class CodeListFactory {
    public static createCodeListItem = (
        externalCodeListItem: IExternalCodeListItem
    ): ICodeListItem => ({
        label: externalCodeListItem.kooselite,
        listId: externalCodeListItem.koolista,
        orderNumber: externalCodeListItem.koojarjestys,
        value: externalCodeListItem.kookoodi,
    });
}

export default CodeListFactory;
