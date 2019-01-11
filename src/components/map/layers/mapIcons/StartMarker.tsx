import * as React from 'react';
import * as L from 'leaflet';
import { Marker } from 'react-leaflet';
import PinIcon from '~/icons/PinIcon';
import { createDivIcon, VERY_HIGH_Z_INDEX } from './NodeMarker';

interface IStartMarkerProps {
    latLng: L.LatLng;
    color: string;
}

const startMarker = ({ latLng, color }: IStartMarkerProps) => {
    return (
        <Marker
            zIndexOffset={VERY_HIGH_Z_INDEX}
            icon={createDivIcon(<PinIcon color={color}/>)}
            position={latLng}
        />
    );
};

export default startMarker;
