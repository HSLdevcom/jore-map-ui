import React from 'react';
import classnames from 'classnames';
import InputContainer from '~/components/sidebar/InputContainer';
import NodeType from '~/enums/nodeType';
import NodeLocationType from '~/types/NodeLocationType';
import NodeTypeColorHelper from '~/util/nodeTypeColorHelper';
import * as L from 'leaflet';
import * as s from '~/components/sidebar/networkView/node/nodeCoordinatesView.scss';

interface INodeCoordinatesViewProps {
    nodeType: NodeType;
    locationType: NodeLocationType;
    coordinates: L.LatLng;
    onChangeCoordinates: (coordinatesType: NodeLocationType, coordinates: L.LatLng) => void;
}

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

    const getIcon = (locationType: NodeLocationType) => {
        let className: string = '';

        switch (locationType) {
        case 'coordinates':
            className = NodeTypeColorHelper.getTypeClass(nodeType, true);
            break;
        case 'coordinatesManual':
            className = s.manual;
            break;
        case 'coordinatesProjection':
            className = s.projected;
            break;
        }

        return className;
    };

    return (
        <div className={s.nodeCoordinatesView}>
            <div className={s.nodeCoordinatesHeader}>
                {locationType.toString()}
                <div className={classnames(s.labelIcon, getIcon(locationType))}/>
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
