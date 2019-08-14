import ILineTopic from '~/models/ILineTopic';
import IExternalLineTopic from '~/models/externals/IExternalLineTopic';

class LineTopicFactory {
    public static mapExternalLineTopic = (
        externalLineTopic: IExternalLineTopic
    ): ILineTopic => {
        return {
            lineId: externalLineTopic.lintunnus,
            startDate: new Date(externalLineTopic.linalkupvm),
            endDate: new Date(externalLineTopic.linloppupvm),
            lineNameFi: externalLineTopic.linnimi,
            lineShortNameFi: externalLineTopic.linnimilyh,
            lineNameSw: externalLineTopic.linnimir,
            lineShortNameSw: externalLineTopic.linnimilyhr,
            lineStartPlace1Fi: externalLineTopic.linlahtop1,
            lineStartPlace1Sw: externalLineTopic.linlahtop1r,
            lineStartPlace2Fi: externalLineTopic.linlahtop2,
            lineStartPlace2Sw: externalLineTopic.linlahtop2r,
            modifiedBy: externalLineTopic.linkuka,
            modifiedOn: new Date(externalLineTopic.linviimpvm)
        };
    };

    public static createNewLineTopic = (lineId: string): ILineTopic => {
        const defaultDate = new Date();
        defaultDate.setHours(0, 0, 0, 0);

        return {
            lineId,
            startDate: defaultDate,
            endDate: defaultDate,
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

export default LineTopicFactory;
