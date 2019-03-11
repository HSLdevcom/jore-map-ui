import React from 'react';
import classnames from 'classnames';
import InputContainer from '~/components/sidebar/InputContainer';
import NodeType from '~/enums/nodeType';
import NodeLocationType from '~/types/NodeLocationType';
import NodeTypeHelper from '~/util/nodeTypeHelper';
import * as L from 'leaflet';
import * as s from '~/components/sidebar/networkView/nodeView/nodeCoordinatesView.scss';
import { roundLatLng } from '~/util/geomHelper';

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

    latChange = (v: string) => {
        const lat = Number(v);
        this.props.onChangeCoordinates(
            roundLatLng(
                new L.LatLng(
                    lat,
                    this.props.coordinates.lng,
                ),
            ),
        );
    }

    lonChange = (v: string) => {
        const lon = Number(v);
        this.props.onChangeCoordinates(
            roundLatLng(
                new L.LatLng(
                    this.props.coordinates.lat,
                    lon,
                ),
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
                        label={'Latitude'}
                        type='number'
                        disabled={this.props.isEditingDisabled}
                    />
                    <InputContainer
                        value={this.props.coordinates.lng}
                        onChange={this.lonChange}
                        label={'Longitude'}
                        type='number'
                        disabled={this.props.isEditingDisabled}
                    />
                </div>
            </div>
        );
    }
}

export default NodeCoordinatesView;
