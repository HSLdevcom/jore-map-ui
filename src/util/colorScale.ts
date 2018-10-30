import chroma from 'chroma-js';
import IRoute from '~/models/IRoute';

class ColorScale {
    public static getColorMap(routes: IRoute[]) {
        const colorMap = new Map();

        const totalColorCount = routes.reduce((acc, curr) => curr.routePaths.length + acc, 0);
        const colors = this.getColors(totalColorCount);
        routes.forEach((route) => {
            const key = route.routeId;
            const value = colors.splice(0, route.routePaths.length);
            colorMap.set(key, value);
        });

        return colorMap;
    }

    private static getColors(colorCount: number) {
        return chroma.scale(['red', 'yellow', 'green', 'blue'])
        .mode('lch').colors(colorCount);
    }
}

export default ColorScale;
