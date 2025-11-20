export default interface IHastusArea {
    id: string;
    name: string;
}

interface IHastusAreaSaveModel {
    newHastusArea: IHastusArea;
    oldHastusArea: IHastusArea | null;
}

export { IHastusAreaSaveModel };
