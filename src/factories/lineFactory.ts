import { ILine } from '../models';
import TransitType from '../enums/transitType';

const convertTransitTypeCodeToTransitType = (type: string) => {
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

const parseLineNumber = (lineId: string) => {
    return lineId.substring(1).replace(/^0+/, '');
};

const getReiTunnus = (edge: any) => {
    if (!edge || !edge.node.reinimi) {
        return 'Reitillä ei nimeä';
    }
    return edge.node.reinimi;
};

export default class LineFactory {
    public static linjaToILine = (linja: any) => {
        const transitType = convertTransitTypeCodeToTransitType(linja.linverkko);
        const routeName = getReiTunnus(linja.reittisByLintunnus.edges[0]);
        const lineNumber = parseLineNumber(linja.lintunnus);

        return <ILine>{
            routeName,
            lineNumber,
            transitType,
            lineId: linja.lintunnus,
        };
    }

    public static linjasToILines = (linja: any[]) => {
        return linja.map(((node: any) => {
            return LineFactory.linjaToILine(node);
        }));
    }
}
