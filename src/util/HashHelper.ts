class HashHelper {
    public static getHashFromString = (value: string) => {
        let hash = 0;
        let i;
        let chr;
        if (value.length === 0) return hash;
        for (i = 0; i < value.length; i += 1) {
            chr = value.charCodeAt(i);
            hash = (hash << 5) - hash + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    };
}

export default HashHelper;
