import React from 'react';
import { ICoordinates } from '~/models';
import * as s from '~/components/sidebar/nodeView/nodeCoordinatesView.scss';
import InputContainer from '~/components/sidebar/InputContainer';

const nodeCoordinatesView = ({ label, coordinates, onChangeCoordinates }:{
    label: string,
    coordinates: ICoordinates,
    onChangeCoordinates: (coordinates: ICoordinates) => void }) => {
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
                        label={'Lat:'}
                    />
                    <InputContainer
                        value={coordinates.lon}
                        onChange={lonChange}
                        label={'Lon:'}
                    />
            </div>
        </div>
    );
};

export default nodeCoordinatesView;
