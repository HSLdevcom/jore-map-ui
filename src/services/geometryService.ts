import proj4 from 'proj4';
import CoordinateSystem from '~/enums/coordinateSystem';
import { ICoordinates } from '~/models';
import { LatLng } from 'leaflet';

class GeometryService {
    private static projections = {
        KKJ:
            '+proj=tmerc +lat_0=0 +lon_0=24 +k=1 +x_0=2500000 +y_0=0 +ellps=intl' +
            ' +towgs84=-96.062,-82.428,-121.753,4.801,0.345,-1.376,1.496 +units=m +no_defs',
        wgs84:
            '+proj=longlat +datum=WGS84 +no_defs',
        GK25FIN:
            '+proj=tmerc +lat_0=0 +lon_0=25 +k=1 +x_0=25500000 +y_0=0 +ellps=GRS80' +
            ' +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
    };

    public static coordinateNames(coordSys: CoordinateSystem) {
        switch (coordSys) {
        case CoordinateSystem.EPSG4326:
            return { x: 'Lat', y: 'Lon' };
        case CoordinateSystem.EPSG3879:
            return { x: 'P', y: 'I' };
        default:
            return { x: 'x', y: 'y' };
        }
    }

    public static nextCoordinateSystem(coordSys: CoordinateSystem) {
        switch (coordSys) {
        case CoordinateSystem.EPSG4326:
            return CoordinateSystem.EPSG3879;
        case CoordinateSystem.EPSG3879:
            return CoordinateSystem.EPSG4326;
        default:
            return CoordinateSystem.EPSG4326;
        }
    }

    public static reprojectToCrs(
        lat: number,
        lon: number,
        toCoordSys: CoordinateSystem,
        fromCoordSys: CoordinateSystem = CoordinateSystem.EPSG4326): number[] {
        if (fromCoordSys === toCoordSys) {
            return [lat, lon];
        }
        return proj4(this.projections[fromCoordSys], this.projections[toCoordSys])
            .forward([lon, lat]).reverse();
    }

    public static iCoordinateToLatLng = (coordinate: ICoordinates) => {
        return new LatLng(coordinate.lat, coordinate.lon);
    }
}

export default GeometryService;
