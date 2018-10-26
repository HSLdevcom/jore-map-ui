import { ILine, ILineRoute } from '~/models';
import TransitTypeHelper from '~/util/transitTypeHelper';

interface IExternalLine {
    linjoukkollaji: string;
    lintunnus: string;
    linverkko: string;
    reittisByLintunnus: {
        nodes: Object[],
    };
}

class LineFactory {
    // linja to ILine
    public static createLine = (linja: IExternalLine): ILine => {
        const transitType = TransitTypeHelper.convertTransitTypeCodeToTransitType(linja.linverkko);
        const lineNumber = _parseLineNumber(linja.lintunnus);
        const routes = linja.reittisByLintunnus.nodes.map((route: any): ILineRoute => {
            return {
                id: route.reitunnus,
                name: _getRouteName(route),
                date: route.reiviimpvm,
            };
        });

        return {
            lineNumber,
            transitType,
            routes,
            lineId: linja.lintunnus,
        };
    }
}

const _parseLineNumber = (lineId: string) => {
    return lineId.substring(1).replace(/^0+/, '');
};

const _getRouteName = (route: any) => {
    if (!route || !route.reinimi) {
        return 'Reitillä ei nimeä';
    }
    return route.reinimi;
};

export default LineFactory;
