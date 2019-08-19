import ILineTopic from '~/models/ILineTopic';
import IExternalLineTopic from '~/models/externals/IExternalLineTopic';

class LineTopicFactory {
    public static mapExternalLineTopic = (
        externalLineTopic: IExternalLineTopic
    ): ILineTopic => {
        return {
            lineId: externalLineTopic.lintunnus,
            originalStartDate: new Date(externalLineTopic.linalkupvm),
            startDate: new Date(externalLineTopic.linalkupvm),
            endDate: new Date(externalLineTopic.linloppupvm),
            lineNameFi: externalLineTopic.linnimi,
            lineShortNameFi: externalLineTopic.linnimilyh,
            lineNameSw: externalLineTopic.linnimir,
            lineShortNameSw: externalLineTopic.linnimilyhr,
            lineStartPlace1Fi: externalLineTopic.linlahtop1,
            lineStartPlace1Sw: externalLineTopic.linlahtop1R,
            lineStartPlace2Fi: externalLineTopic.linlahtop2,
            lineStartPlace2Sw: externalLineTopic.linlahtop2R,
            modifiedBy: externalLineTopic.linkuka,
            modifiedOn: externalLineTopic.linviimpvm
                ? new Date(externalLineTopic.linviimpvm)
                : undefined
        };
    };

    public static createNewLineTopic = (lineId: string): ILineTopic => {
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

export default LineTopicFactory;
