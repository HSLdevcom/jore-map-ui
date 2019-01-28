import React from 'react';
import classnames from 'classnames';
import InputContainer from '~/components/sidebar/InputContainer';
import NodeLocationType from '~/enums/nodeLocationType';
import NodeType from '~/enums/nodeType';
import NodeTypeColorHelper from '~/util/nodeTypeColorHelper';
import * as L from 'leaflet';
import * as s from '~/components/sidebar/networkView/node/nodeCoordinatesView.scss';

interface INodeCoordinatesViewProps {
    nodeType: NodeType;
    locationType: NodeLocationType;
    coordinates: L.LatLng;
    onChangeCoordinates: (coordinates: L.LatLng) => void;
}

const nodeCoordinatesView = ({ nodeType, locationType, coordinates, onChangeCoordinates }:
                                 INodeCoordinatesViewProps) => {
    const latChange = (v: string) => {
        const lat = Number(v);
        onChangeCoordinates(new L.LatLng(lat, coordinates.lng));
    };
    const lonChange = (v: string) => {
        const lon = Number(v);
        onChangeCoordinates(new L.LatLng(coordinates.lat, lon));
    };

    const getIcon = (locationType: NodeLocationType) => {
        let className: string = '';

        switch (locationType) {
        case NodeLocationType.Measured:
            className = NodeTypeColorHelper.getTypeClass(nodeType, true);
            break;
        case NodeLocationType.Manual:
            className = s.manual;
            break;
        case NodeLocationType.Projected:
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
