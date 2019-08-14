export default interface ILineTopic {
    lineId: string;
    startDate: Date;
    endDate: Date;
    lineNameFi: string;
    lineShortNameFi?: string;
    lineNameSw?: string;
    lineShortNameSw?: string;
    lineStartPlace1Fi?: string;
    lineStartPlace1Sw?: string;
    lineStartPlace2Fi?: string;
    lineStartPlace2Sw?: string;
    modifiedBy?: string;
    modifiedOn?: Date;
}
