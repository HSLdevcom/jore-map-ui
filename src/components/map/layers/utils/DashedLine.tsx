import React, { Component } from 'react';
import { Polyline } from 'react-leaflet';

interface IDashedLineProps {
    startPoint: L.LatLng;
    endPoint: L.LatLng;
    color?: string;
}

class DashedLine extends Component<IDashedLineProps> {
    static defaultProps = {
        color: '#efc210'
    }

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

export default DashedLine;
