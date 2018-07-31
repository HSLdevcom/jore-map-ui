import proj4 from 'proj4';

enum CoordinateSystem{
    EPSG2392 = 'KKJ',
    EPSG4326 = 'wgs84',
}

namespace CoordinateSystem {
    const projections = {
        KKJ:
            '+proj=tmerc +lat_0=0 +lon_0=24 +k=1 +x_0=2500000 +y_0=0 +ellps=intl' +
            ' +towgs84=-96.062,-82.428,-121.753,4.801,0.345,-1.376,1.496 +units=m +no_defs',
        wgs84:
            '+proj=longlat +datum=WGS84 +no_defs',
    };

    export function coordinateNames(coordSys: CoordinateSystem) {
        switch (coordSys) {
        case CoordinateSystem.EPSG4326:
            return { x: 'Lat', y: 'Lon' };
        case CoordinateSystem.EPSG2392:
            return { x: 'P', y: 'I' };
        default:
            return { x: 'x', y: 'y' };
        }
    }

    export function nextCoordinateSystem(coordSys: CoordinateSystem) {
        switch (coordSys) {
        case CoordinateSystem.EPSG4326:
            return CoordinateSystem.EPSG2392;
        case CoordinateSystem.EPSG2392:
            return CoordinateSystem.EPSG4326;
        default:
            return CoordinateSystem.EPSG4326;
        }
    }

    export function convertToCoordinateSystem(
        lat: number,
        lon: number,
        toCoordSys: CoordinateSystem,
        fromCoordSys: CoordinateSystem = CoordinateSystem.EPSG4326):number[] {
        if (fromCoordSys === toCoordSys) {
            return [lat, lon];
        }
        return proj4(projections[fromCoordSys], projections[toCoordSys])
            .forward([lon, lat]).map(x => Number(x.toPrecision(10))).reverse();
    }
}

export default CoordinateSystem;
