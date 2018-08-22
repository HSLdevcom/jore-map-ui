import * as chroma from 'chroma-js';

class colorScale {
    public static getColors(colorCount: number) {
        return chroma.scale(['red', 'yellow', 'green', 'blue'])
        .mode('lch').colors(colorCount);
    }
}

export default colorScale;
