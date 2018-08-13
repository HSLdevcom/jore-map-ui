import { ILine } from '../models';
import TransitType from '../enums/transitType';

class LineFactory {
    // linja to ILine
    public static createLine = (linja: any) => {
        const transitType = _convertTransitTypeCodeToTransitType(linja.linverkko);
        const lineName = _getReiTunnus(linja.reittisByLintunnus.edges[0]);
        const lineNumber = _parseLineNumber(linja.lintunnus);

        return <ILine>{
            lineName,
            lineNumber,
            transitType,
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

const _getReiTunnus = (edge: any) => {
    if (!edge || !edge.node.reinimi) {
        return 'Reitillä ei nimeä';
    }
    return edge.node.reinimi;
};

export default LineFactory;
