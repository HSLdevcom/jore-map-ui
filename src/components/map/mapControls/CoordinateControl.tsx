import classnames from 'classnames';
import * as L from 'leaflet';
import { reaction, IReactionDisposer } from 'mobx';
import proj4 from 'proj4';
import React, { Component } from 'react';
import CoordinateSystem from '~/enums/coordinateSystem';
import MapStore from '~/stores/mapStore';
import * as s from './coordinateControl.scss';

interface ICoordinateControlProps {
    precision?: number;
}

const PROJECTIONS = {
    KKJ:
        '+proj=tmerc +lat_0=0 +lon_0=24 +k=1 +x_0=2500000 +y_0=0 +ellps=intl' +
        ' +towgs84=-96.062,-82.428,-121.753,4.801,0.345,-1.376,1.496 +units=m +no_defs',
    wgs84: '+proj=longlat +datum=WGS84 +no_defs',
    GK25FIN:
        '+proj=tmerc +lat_0=0 +lon_0=25 +k=1 +x_0=25500000 +y_0=0 +ellps=GRS80' +
        ' +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
};

interface ICoordinateControlState {
    x: string;
    y: string;
}

const PRECISION_DEFAULT_VALUE = 10;

class CoordinateControl extends Component<ICoordinateControlProps, ICoordinateControlState> {
    private coordinatesListener: IReactionDisposer;
    private xButtonRef: React.RefObject<HTMLInputElement>;
    private yButtonRef: React.RefObject<HTMLInputElement>;
    private mounted: boolean;

    constructor(props: ICoordinateControlProps) {
        super(props);

        this.xButtonRef = React.createRef();
        this.yButtonRef = React.createRef();
        this.mounted = false;

        if (MapStore!.coordinates) {
            const [lat, lon] = this.getDisplayCoordinates();
            this.state = {
                x: String(lon),
                y: String(lat)
            };
        }
        this.coordinatesListener = reaction(() => MapStore!.coordinates, this.updateCoordinates);
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.coordinatesListener();
    }

    private updateCoordinates = () => {
        if (!this.mounted || !MapStore!.coordinates) return;

        const coordinates = MapStore!.coordinates;
        const displayCoordinateSystem = MapStore!.displayCoordinateSystem;
        const [lat, lon] = _reprojectToCrs(
            coordinates!.lat,
            coordinates!.lng,
            displayCoordinateSystem
        ).map(coord =>
            coord.toPrecision(this.props.precision ? this.props.precision : PRECISION_DEFAULT_VALUE)
        );

        this.setState({
            x: lon,
            y: lat
        });
    };

    private getDisplayCoordinates() {
        const coordinates = MapStore!.coordinates;
        if (!coordinates) return null;
        const displayCoordinateSystem = MapStore!.displayCoordinateSystem;
        return _reprojectToCrs(coordinates!.lat, coordinates!.lng, displayCoordinateSystem);
    }

    private toggleDisplayCoordinateSystem = () => {
        MapStore!.setDisplayCoordinateSystem(
            _nextCoordinateSystem(MapStore!.displayCoordinateSystem)
        );
        this.updateCoordinates();
    };

    private onInputBlur = () => {
        if (!this.state?.y || !this.state?.x) return;

        const newY = Number(this.state.y);
        const newX = Number(this.state.x);
        if (!isNaN(newY) && !isNaN(newX)) {
            this.setMapCoordinates(newY, newX);
        }
    };

    private setMapCoordinates = (lat: number, lon: number) => {
        const [wgsLat, wgsLon] = _reprojectToCrs(
            lat,
            lon,
            CoordinateSystem.EPSG4326,
            MapStore!.displayCoordinateSystem
        );
        MapStore!.setCoordinates(new L.LatLng(wgsLat, wgsLon));
    };

    private onInputKeyPress = (e: any) => {
        if (e.key === 'Enter') {
            this.xButtonRef.current!.blur();
            this.yButtonRef.current!.blur();
        }
    };

    private onLonInputChange = (e: React.FormEvent<HTMLInputElement>) => {
        this.setState({
            x: e.currentTarget.value
        });
    };

    private onLatInputChange = (e: React.FormEvent<HTMLInputElement>) => {
        this.setState({
            y: e.currentTarget.value
        });
    };

    private getCoordinateNames = (coordSys: CoordinateSystem) => {
        switch (coordSys) {
            case CoordinateSystem.EPSG4326:
                return { x: 'Lon', y: 'Lat' };
            case CoordinateSystem.EPSG3879:
                return { x: 'I', y: 'P' };
            default:
                return { x: 'x', y: 'y' };
        }
    };

    render() {
        const isLoading = !MapStore!.coordinates;
        const coordinateNames = this.getCoordinateNames(MapStore!.displayCoordinateSystem);
        const y = this.state?.y || '';
        const x = this.state?.x || '';

        return (
            <div className={classnames(s.coordinateControl, isLoading ? s.disabled : undefined)}>
                <div>
                    <button onClick={this.toggleDisplayCoordinateSystem}>
                        {coordinateNames.y}
                    </button>
                    <input
                        ref={this.yButtonRef}
                        value={y}
                        onChange={this.onLatInputChange}
                        onBlur={this.onInputBlur}
                        onKeyPress={this.onInputKeyPress}
                    />
                </div>
                <div>
                    <button onClick={this.toggleDisplayCoordinateSystem}>
                        {coordinateNames.x}
                    </button>
                    <input
                        ref={this.xButtonRef}
                        value={x}
                        onChange={this.onLonInputChange}
                        onBlur={this.onInputBlur}
                        onKeyPress={this.onInputKeyPress}
                    />
                </div>
            </div>
        );
    }
}

const _nextCoordinateSystem = (coordSys: CoordinateSystem) => {
    switch (coordSys) {
        case CoordinateSystem.EPSG4326:
            return CoordinateSystem.EPSG3879;
        case CoordinateSystem.EPSG3879:
            return CoordinateSystem.EPSG4326;
        default:
            return CoordinateSystem.EPSG4326;
    }
};

const _reprojectToCrs = (
    lat: number,
    lon: number,
    toCoordSys: CoordinateSystem,
    fromCoordSys: CoordinateSystem = CoordinateSystem.EPSG4326
) => {
    if (fromCoordSys === toCoordSys) {
        return [lat, lon];
    }
    return proj4(PROJECTIONS[fromCoordSys], PROJECTIONS[toCoordSys])
        .forward([lon, lat])
        .reverse();
};

export default CoordinateControl;
