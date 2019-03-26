interface ILineRoutePrimaryKey {
    id: string;
}

export default interface ILineRoute extends ILineRoutePrimaryKey {
    name: string;
    date: Date;
}

export {
    ILineRoutePrimaryKey,
};
