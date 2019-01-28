
class ColorScale {
    public static allColors = [
        '#e6194B',
        '#3cb44b',
        '#ffe119',
        '#4363d8',
        '#f58231',
        '#42d4f4',
        '#f032e6',
        '#fabebe',
        '#469990',
        '#e6beff',
        '#9A6324',
        // '#fffac8',
        '#800000',
        '#aaffc3',
        '#000075',
        // '#a9a9a9',
    ];

    public colorStack: string[];

    constructor() {
        this.colorStack = ColorScale.allColors.slice();
    }

    public reserveColor = () => {
        if (this.colorStack.length < 1) {
            return '#007ac9';
        }
        return this.colorStack.pop();
    }

    public releaseColor = (color: string) => {
        if (ColorScale.allColors.includes(color)) {
            this.colorStack.push(color);
        }
        return undefined;
    }
}

export default ColorScale;
