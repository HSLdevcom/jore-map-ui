import * as L from 'leaflet';
import _ from 'lodash';
import React from 'react';
import InputContainer from '~/components/controls/InputContainer';
import constants from '~/constants/constants';
import FormValidator, { IValidationResult } from '~/validation/FormValidator';
import * as s from './coordinateInputRow.scss';

interface ICoordinateInputRowProps {
    isEditingDisabled: boolean;
    label: JSX.Element;
    coordinates: L.LatLng;
    onChange: Function;
}

interface ICoordinateInputRowState {
    lat?: number;
    lng?: number;
}

class CoordinateInputRow extends React.Component<
    ICoordinateInputRowProps,
    ICoordinateInputRowState
> {
    constructor(props: ICoordinateInputRowProps) {
        super(props);

        this.state = {
            lat: props.coordinates.lat,
            lng: props.coordinates.lng,
        };
    }

    componentDidUpdate(prevProps: ICoordinateInputRowProps) {
        if (this.props.coordinates !== prevProps.coordinates) {
            this.setState({
                lat: this.props.coordinates.lat,
                lng: this.props.coordinates.lng,
            });
        }
    }

    private onLatChange = (value?: number) => {
        this.setState({ lat: value });
        this.onCoordinatesChange(value, this.state.lng);
    };

    private onLngChange = (value?: number) => {
        this.setState({ lng: value });
        this.onCoordinatesChange(this.state.lat, value);
    };

    private onCoordinatesChange = (lat?: number, lng?: number) => {
        const latLng = this.getCoordinates(lat, lng);
        if (latLng) {
            this.props.onChange(latLng);
        }
    };

    private getCoordinates = (lat?: number, lng?: number) => {
        if (!lat || !lng) return null;

        let latLng;
        try {
            latLng = new L.LatLng(lat, lng);
        } catch (e) {
            latLng = null;
        }
        return latLng;
    };

    render() {
        const lat = this.state.lat;
        const lng = this.state.lng;
        const { isEditingDisabled, label } = this.props;

        const coordinates = this.getCoordinates(lat, lng);
        let validationResult: IValidationResult;
        if (coordinates) {
            validationResult = FormValidator.validateProperty('latLngValidator', coordinates);
        } else {
            validationResult = {
                isValid: false,
                errorMessage: 'Koordinaatti ei saa olla tyhjä.',
            };
        }
        return (
            <>
                {label}
                <div className={s.flexRow}>
                    <InputContainer
                        value={lat}
                        type='number'
                        decimalLimit={constants.DECIMALS_IN_GEOMETRIES}
                        onChange={this.onLatChange}
                        label='LATITUDE'
                        disabled={isEditingDisabled}
                        validationResult={validationResult}
                    />
                    <InputContainer
                        value={lng}
                        type='number'
                        decimalLimit={constants.DECIMALS_IN_GEOMETRIES}
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
