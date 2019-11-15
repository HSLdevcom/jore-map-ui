import ILineHeader from '~/models/ILineHeader';
import IExternalLineHeader from '~/models/externals/IExternalLineHeader';

class LineHeaderFactory {
    public static mapExternalLineHeader = (
        externalLineHeader: IExternalLineHeader
    ): ILineHeader => {
        return {
            lineId: externalLineHeader.lintunnus,
            originalStartDate: new Date(externalLineHeader.linalkupvm),
            startDate: new Date(externalLineHeader.linalkupvm),
            endDate: new Date(externalLineHeader.linloppupvm),
            lineNameFi: externalLineHeader.linnimi,
            lineShortNameFi: externalLineHeader.linnimilyh,
            lineNameSw: externalLineHeader.linnimir,
            lineShortNameSw: externalLineHeader.linnimilyhr,
            lineStartPlace1Fi: externalLineHeader.linlahtop1,
            lineStartPlace1Sw: externalLineHeader.linlahtop1R,
            lineStartPlace2Fi: externalLineHeader.linlahtop2,
            lineStartPlace2Sw: externalLineHeader.linlahtop2R,
            modifiedBy: externalLineHeader.linkuka,
            modifiedOn: externalLineHeader.linviimpvm
                ? new Date(externalLineHeader.linviimpvm)
                : undefined
        };
    };

    public static createNewLineHeader = (lineId: string): ILineHeader => {
        const defaultDate = new Date();
        defaultDate.setHours(0, 0, 0, 0);

        return {
            lineId,
            originalStartDate: undefined,
            startDate: new Date(defaultDate.getTime()),
            endDate: new Date(defaultDate.getTime()),
            lineNameFi: '',
            lineShortNameFi: '',
            lineNameSw: '',
            lineShortNameSw: '',
            lineStartPlace1Fi: '',
            lineStartPlace1Sw: '',
            lineStartPlace2Fi: '',
            lineStartPlace2Sw: '',
            modifiedBy: '',
            modifiedOn: new Date()
        };
    };
}

export default LineHeaderFactory;
