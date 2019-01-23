import React from 'react';
import { ICoordinates } from '~/models';
import * as s from '~/components/sidebar/networkView/node/nodeCoordinatesView.scss';
import InputContainer from '~/components/sidebar/InputContainer';

interface INodeCoordinatesViewProps {
    label: string;
    coordinates: ICoordinates;
    onChangeCoordinates: (coordinates: ICoordinates) => void;
}

const nodeCoordinatesView = ({ label, coordinates, onChangeCoordinates }:
                                 INodeCoordinatesViewProps) => {
    const latChange = (v: string) => {
        const lat = Number(v);
        onChangeCoordinates({ ...coordinates, lat });
    };
    const lonChange = (v: string) => {
        const lon = Number(v);
        onChangeCoordinates({ ...coordinates, lon });
    };
    return (
        <div className={s.nodeCoordinatesView}>
            <label>{label}</label>
            <div className={s.coordinatesInputs}>
                    <InputContainer
                        value={coordinates.lat}
                        onChange={latChange}
                        label={'Latitude'}
                    />
                    <InputContainer
                        value={coordinates.lon}
                        onChange={lonChange}
                        label={'Longitude'}
                    />
            </div>
        </div>
    );
};

export default nodeCoordinatesView;
