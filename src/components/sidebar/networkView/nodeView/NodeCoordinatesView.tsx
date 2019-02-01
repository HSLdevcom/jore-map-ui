import React from 'react';
import classnames from 'classnames';
import InputContainer from '~/components/sidebar/InputContainer';
import NodeType from '~/enums/nodeType';
import NodeLocationType from '~/types/NodeLocationType';
import NodeTypeColorHelper from '~/util/nodeTypeColorHelper';
import * as L from 'leaflet';
import * as s from '~/components/sidebar/networkView/nodeView/nodeCoordinatesView.scss';

interface INodeCoordinatesViewProps {
    nodeType: NodeType;
    locationType: NodeLocationType;
    coordinates: L.LatLng;
    onChangeCoordinates: (coordinatesType: NodeLocationType, coordinates: L.LatLng) => void;
}

const getCoordinateSpecificData = (locationType: NodeLocationType, nodeType: NodeType) => {
    let iconClassName = '';
    let label = '';

    switch (locationType) {
    case 'coordinates':
        iconClassName = NodeTypeColorHelper.getTypeClass(nodeType, true);
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
};

const nodeCoordinatesView = ({ nodeType, locationType, coordinates, onChangeCoordinates }:
                                 INodeCoordinatesViewProps) => {
    const latChange = (v: string) => {
        const lat = Number(v);
        onChangeCoordinates(locationType, new L.LatLng(lat, coordinates.lng));
    };
    const lonChange = (v: string) => {
        const lon = Number(v);
        onChangeCoordinates(locationType, new L.LatLng(coordinates.lat, lon));
    };

    const { iconClassName, label } = getCoordinateSpecificData(locationType, nodeType);

    return (
        <div className={s.nodeCoordinatesView}>
            <div className={s.nodeCoordinatesHeader}>
                {label}
                <div className={classnames(s.labelIcon, iconClassName)}/>
            </div>
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
