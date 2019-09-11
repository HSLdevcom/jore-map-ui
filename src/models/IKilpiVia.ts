interface IKilpiViaPrimaryKey {
    relid: number;
}

export default interface IKilpiVia extends IKilpiViaPrimaryKey {
    nameSw: string,
    nameFi: string
}


export { IKilpiVia, IKilpiViaPrimaryKey };
