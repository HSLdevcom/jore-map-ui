import React from 'react';
import * as L from 'leaflet';
import classnames from 'classnames';
import InputContainer from '~/components/sidebar/InputContainer';
import NodeType from '~/enums/nodeType';
import NodeLocationType from '~/types/NodeLocationType';
import NodeTypeHelper from '~/util/nodeTypeHelper';
import * as s from './nodeCoordinatesView.scss';

interface INodeCoordinatesViewProps {
    nodeType: NodeType;
    locationType: NodeLocationType;
    coordinates: L.LatLng;
    isEditingDisabled: boolean;
    onChangeCoordinates: (coordinates: L.LatLng) => void;
}

class NodeCoordinatesView extends React.Component<INodeCoordinatesViewProps> {
    getCoordinateSpecificData = (locationType: NodeLocationType, nodeType: NodeType) => {
        let iconClassName = '';
        let label = '';

        switch (locationType) {
        case 'coordinates':
            iconClassName = NodeTypeHelper.getTypeClass(nodeType, true);
            label = 'Mitattu piste';
            break;
        case 'coordinatesManual':
            iconClassName = s.manual;
            label = 'Sovitettu piste';
            break;
        case 'coordinatesProjection':
            iconClassName = s.projected;
            label = 'Projektoitu piste';
            break;
        }

        return { iconClassName, label };
    }

    latChange = (value: string) => {
        const lat = Number(value);
        if (lat === this.props.coordinates.lat) return;
        this.props.onChangeCoordinates(
            new L.LatLng(
                lat,
                this.props.coordinates.lng,
            ),
        );
    }

    lngChange = (value: string) => {
        const lng = Number(value);
        if (lng === this.props.coordinates.lng) return;
        this.props.onChangeCoordinates(
            new L.LatLng(
                this.props.coordinates.lat,
                lng,
            ),
        );
    }

    render() {
        const { iconClassName, label } =
            this.getCoordinateSpecificData(this.props.locationType, this.props.nodeType);

        return (
            <div className={s.nodeCoordinatesView}>
                <div className={s.nodeCoordinatesHeader}>
                    {label}
                    <div className={classnames(s.labelIcon, iconClassName)}/>
                </div>
                <div className={s.coordinatesInputs}>
                    <InputContainer
                        value={this.props.coordinates.lat}
                        onChange={this.latChange}
                        label='Latitude'
                        type='number'
                        disabled={this.props.isEditingDisabled}
                    />
                    <InputContainer
                        value={this.props.coordinates.lng}
                        onChange={this.lngChange}
                        label='Longitude'
                        type='number'
                        disabled={this.props.isEditingDisabled}
                    />
                </div>
            </div>
        );
    }
}

export default NodeCoordinatesView;
