interface IKilpiViaPrimaryKey {
    relid: number;
}

export default interface IKilpiVia extends IKilpiViaPrimaryKey {
    viaruotsi: string,
    viasuomi: string
}


export { IKilpiVia, IKilpiViaPrimaryKey };
