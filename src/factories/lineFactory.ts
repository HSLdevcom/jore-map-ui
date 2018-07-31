import lineHelper from '../util/lineHelper';
import { ILine } from '../models';

const linjaToILine = (linja: any) => {
    const routeNumber = lineHelper.getReiTunnus(linja.reittisByLintunnus.edges[0]);
    const lineNumber = lineHelper.parseLineNumber(linja.lintunnus);

    return <ILine>{
        routeNumber,
        lineNumber,
        lineId: linja.lintunnus,
        lineLayer: linja.linverkko,
    };
};

const linjasToILines = (linja: any[]) => {
    return linja.map(((node: any) => {
        return linjaToILine(node);
    }));
};

export default {
    linjaToILine,
    linjasToILines,
};
