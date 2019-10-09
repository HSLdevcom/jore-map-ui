import React, { Component } from 'react';
import { Polyline } from 'react-leaflet';

interface IDashedLineProps {
    startPoint: L.LatLng;
    endPoint: L.LatLng;
    color: string;
}

class LinkDashedLines extends Component<IDashedLineProps> {
    render() {
        const { startPoint, endPoint, color } = this.props;

        if (startPoint.equals(endPoint)) {
            return null;
        }
        return (
            <Polyline
                positions={[startPoint, endPoint]}
                color={color}
                weight={5}
                opacity={0.75}
                dashArray={'10, 10'}
            />
        );
    }
}

export default LinkDashedLines;
