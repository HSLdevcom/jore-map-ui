import { ILine, ILineRoute } from '../models';
import TransitType from '../enums/transitType';

class LineFactory {
    // linja to ILine
    public static createLine = (linja: any): ILine => {
        const transitType = _convertTransitTypeCodeToTransitType(linja.linverkko);
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

    public static linjasToILines = (linjat: any[]) => {
        return linjat.map(((node: any) => {
            return LineFactory.createLine(node);
        }));
    }
}

const _convertTransitTypeCodeToTransitType = (type: string) => {
    switch (type) {
    case '1':
        return TransitType.BUS;
    case '2':
        return TransitType.SUBWAY;
    case '3':
        return TransitType.TRAM;
    case '4':
        return TransitType.TRAIN;
    case '7':
        return TransitType.FERRY;
    default:
        return TransitType.NOT_FOUND;
    }
};

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
