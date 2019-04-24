interface ISearchLineRoutePrimaryKey {
    id: string;
}

export default interface ISearchLineRoute extends ISearchLineRoutePrimaryKey {
    name: string;
    date: Date;
}

export {
    ISearchLineRoutePrimaryKey,
};