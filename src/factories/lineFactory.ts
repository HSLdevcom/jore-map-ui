import { ILine } from '../models';
import TransitType from '../enums/transitType';

export default class LineFactory {
    private static convertTransitTypeCodeToTransitType = (type: string) => {
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
    }

    private static parseLineNumber = (lineId: string) => {
        return lineId.substring(1).replace(/^0+/, '');
    }

    private static getReiTunnus = (edge: any) => {
        if (!edge || !edge.node.reinimi) {
            return 'Reitillä ei nimeä';
        }
        return edge.node.reinimi;
    }

    public static linjaToILine = (linja: any) => {
        const transitType = LineFactory.convertTransitTypeCodeToTransitType(linja.linverkko);
        const routeNumber = LineFactory.getReiTunnus(linja.reittisByLintunnus.edges[0]);
        const lineNumber = LineFactory.parseLineNumber(linja.lintunnus);

        return <ILine>{
            routeNumber,
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
