import { LatLng } from 'leaflet';

const createCoherentLinesFromPolylines = (polylines: LatLng[][]) => {
    const res: LatLng[][] = [];
    let workbench: LatLng[] = [];
    polylines.forEach((line) => {
        if (workbench.length === 0 || workbench[workbench.length - 1].equals(line[0])) {
            workbench = workbench.concat(line);
        } else {
            res.push(workbench);
            workbench = [];
        }
    });
    if (workbench.length > 0) {
        res.push(workbench);
    }
    return res;
};

export {
    createCoherentLinesFromPolylines,
};
