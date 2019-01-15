import React, { FormEvent } from 'react';
import { ICoordinates } from '~/models';
import * as s from '~/components/sidebar/nodeView/nodeCoordinatesView.scss';

const nodeCoordinatesView = ({ label, coordinates, onChangeCoordinates }:{
    label: string,
    coordinates: ICoordinates,
    onChangeCoordinates: (coordinates: ICoordinates) => void }) => {
    const latChange = (e: FormEvent<HTMLInputElement>) => {
        const lat = Number(e.currentTarget.value);
        onChangeCoordinates({ ...coordinates, lat });
    };
    const lonChange = (e: FormEvent<HTMLInputElement>) => {
        const lon = Number(e.currentTarget.value);
        onChangeCoordinates({ ...coordinates, lon });
    };
    return (
        <div className={s.nodeCoordinatesView}>
            <label>{label}</label>
            <div className={s.coordinatesInputs}>
                <div>
                    <label>
                        Lat:
                    </label>
                    <input value={coordinates.lat} type='number' onChange={latChange}/>
                </div>
                <div>
                    <label>
                        Lon:
                    </label>
                    <input value={coordinates.lon} type='number' onChange={lonChange}/>
                </div>
            </div>
        </div>
    );
};

export default nodeCoordinatesView;
