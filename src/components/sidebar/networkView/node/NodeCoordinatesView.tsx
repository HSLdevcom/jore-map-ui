import React from 'react';
import classnames from 'classnames';
import * as L from 'leaflet';
import * as s from '~/components/sidebar/networkView/node/nodeCoordinatesView.scss';
import InputContainer from '~/components/sidebar/InputContainer';

interface INodeCoordinatesViewProps {
    label: string;
    coordinates: L.LatLng;
    onChangeCoordinates: (coordinates: L.LatLng) => void;
}

const nodeCoordinatesView = ({ label, coordinates, onChangeCoordinates }:
                                 INodeCoordinatesViewProps) => {
    const latChange = (v: string) => {
        const lat = Number(v);
        onChangeCoordinates(new L.LatLng(lat, coordinates.lng));
    };
    const lonChange = (v: string) => {
        const lon = Number(v);
        onChangeCoordinates(new L.LatLng(coordinates.lat, lon));
    };

    return (
        <div className={classnames(s.nodeCoordinatesView, s.formSection)}>
            <label>{label}</label>
            <div className={s.coordinatesInputs}>
                <InputContainer
                    value={coordinates.lat}
                    onChange={latChange}
                    label={'Latitude'}
                />
                <InputContainer
                    value={coordinates.lng}
                    onChange={lonChange}
                    label={'Longitude'}
                />
            </div>
        </div>
    );
};

export default nodeCoordinatesView;
