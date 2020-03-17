import * as L from 'leaflet';
import _ from 'lodash';
import React from 'react';
import InputContainer from '~/components/controls/InputContainer';
import FormValidator from '~/validation/FormValidator';
import * as s from './coordinateInputRow.scss';

interface ICoordinateInputRowProps {
    isEditingDisabled: boolean;
    label: JSX.Element;
    coordinates: L.LatLng;
    onChange: Function;
}

interface ICoordinateInputRowState {
    lat: number;
    lng: number;
}

class CoordinateInputRow extends React.Component<
    ICoordinateInputRowProps,
    ICoordinateInputRowState
> {
    constructor(props: ICoordinateInputRowProps) {
        super(props);

        this.state = {
            lat: props.coordinates.lat,
            lng: props.coordinates.lng
        };
    }

    private onLatChange = (value: number) => {
        this.setState({ lat: value });
        this.onCoordinatesChange(value, this.state.lng);
    };

    private onLngChange = (value: number) => {
        this.setState({ lng: value });
        this.onCoordinatesChange(this.state.lat, value);
    };

    private onCoordinatesChange = (lat: number, lng: number) => {
        let latLng;
        try {
            latLng = new L.LatLng(lat, lng);
        } catch (e) {
            latLng = null;
        }
        if (latLng) {
            this.props.onChange(latLng);
        }
    };

    render() {
        const { isEditingDisabled, label, coordinates } = this.props;

        const validationResult = FormValidator.validateProperty('latLngValidator', coordinates);
        return (
            <>
                {label}
                <div className={s.flexRow}>
                    <InputContainer
                        value={coordinates.lat}
                        type='number'
                        onChange={this.onLatChange}
                        label='LATITUDE'
                        disabled={isEditingDisabled}
                        validationResult={validationResult}
                    />
                    <InputContainer
                        value={coordinates.lng}
                        type='number'
                        onChange={this.onLngChange}
                        label='LONGITUDE'
                        disabled={isEditingDisabled}
                        validationResult={validationResult}
                        data-cy='longitudeInput'
                    />
                </div>
            </>
        );
    }
}

export default CoordinateInputRow;
