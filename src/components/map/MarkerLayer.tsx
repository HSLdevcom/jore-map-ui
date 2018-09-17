import React, { Component } from 'react';
import { Marker } from 'react-leaflet';
import * as L from 'leaflet';
import { observer } from 'mobx-react';
import * as s from './markerLayer.scss';
import ColorScale from '../../util/colorScale';
import PinIcon from '../../icons/pin';

interface MarkerLayerProps {
    firstNodes: number[];
}

@observer
export default class MarkerLayer extends Component<MarkerLayerProps> {
    private getStartPointIcon = (color: string) => {
        const divIconOptions : L.DivIconOptions = {
            className: s.nodeMarker,
            html: PinIcon.getPin(color),
        };

        return new L.DivIcon(divIconOptions);
    }

    render() {
        const colors = ColorScale.getColors(this.props.firstNodes.length);
        return this.props.firstNodes.map((coordinates, index) => {
            const icon = this.getStartPointIcon(colors[index]);
            return (
                <Marker
                    icon={icon}
                    key={index}
                    position={[coordinates[1], coordinates[0]]}
                />
            );
        });
    }
}
