import * as chroma from 'chroma-js';

class ColorScale {
    public static getColors(colorCount: number) {
        return chroma.scale(['red', 'yellow', 'green', 'blue'])
        .mode('lch').colors(colorCount);
    }
}

export default ColorScale;
