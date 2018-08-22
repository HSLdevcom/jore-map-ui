import { ILine, ILineRoute } from '../models';
import TransitType from '../enums/transitType';

class LineFactory {
    // linja to ILine
    public static createLine = (linja: any) => {
        const transitType = _convertTransitTypeCodeToTransitType(linja.linverkko);
        const lineNumber = _parseLineNumber(linja.lintunnus);
        const routes = linja.reittisByLintunnus.edges.map((route: any) => {
            return <ILineRoute>{
                id: route.node.reitunnus,
                name: _getRouteName(route),
                date: route.node.reiviimpvm,
            };
        });

        return <ILine>{
            lineNumber,
            transitType,
            routes,
            lineId: linja.lintunnus,
        };
    }

    public static linjasToILines = (linja: any[]) => {
        return linja.map(((node: any) => {
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
    if (!route.node.reinimi) {
        return 'Reitillä ei nimeä';
    }
    return route.node.reinimi;
};

export default LineFactory;
