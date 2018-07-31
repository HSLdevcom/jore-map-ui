import lineHelper from '../util/lineHelper';
import { ILine } from '../models';

export default class LineFactory {
    public static linjaToILine = (linja: any) => {
        const transitType = lineHelper.convertTransitTypeCodeToTransitType(linja.linverkko);
        const routeNumber = lineHelper.getReiTunnus(linja.reittisByLintunnus.edges[0]);
        const lineNumber = lineHelper.parseLineNumber(linja.lintunnus);

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
