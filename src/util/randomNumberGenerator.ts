export default class RandomNumberGenerator {
    public static getWithLength(length: number) {
        return Math.floor((Math.random() * (10 ** length)));
    }
}
