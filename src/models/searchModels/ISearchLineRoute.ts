interface ISearchLineRoutePrimaryKey {
    id: string;
}

export default interface ISearchLineRoute extends ISearchLineRoutePrimaryKey {
    name: string;
    isUsedByRoutePath: boolean;
    date?: Date;
}

export { ISearchLineRoutePrimaryKey };
