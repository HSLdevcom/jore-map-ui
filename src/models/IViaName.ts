interface IViaNamePrimaryKey {
    id: string;
}

export default interface IViaName extends IViaNamePrimaryKey {
    destinationFi1?: string;
    destinationFi2?: string;
    destinationSw1?: string;
    destinationSw2?: string;
}

export { IViaName, IViaNamePrimaryKey };
