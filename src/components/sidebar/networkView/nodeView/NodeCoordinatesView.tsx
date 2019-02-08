import React from 'react';
import classnames from 'classnames';
import InputContainer from '~/components/sidebar/InputContainer';
import NodeType from '~/enums/nodeType';
import NodeLocationType from '~/types/NodeLocationType';
import NodeTypeHelper from '~/util/nodeTypeHelper';
import * as L from 'leaflet';
import * as s from '~/components/sidebar/networkView/nodeView/nodeCoordinatesView.scss';

interface INodeCoordinatesViewProps {
    nodeType: NodeType;
    locationType: NodeLocationType;
    coordinates: L.LatLng;
    isEditingDisabled: boolean;
    onChangeCoordinates: (coordinatesType: NodeLocationType, coordinates: L.LatLng) => void;
}

const getCoordinateSpecificData = (locationType: NodeLocationType, nodeType: NodeType) => {
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
};

const nodeCoordinatesView = (props: INodeCoordinatesViewProps) => {
    const latChange = (v: string) => {
        const lat = Number(v);
        props.onChangeCoordinates(props.locationType, new L.LatLng(lat, props.coordinates.lng));
    };
    const lonChange = (v: string) => {
        const lon = Number(v);
        props.onChangeCoordinates(props.locationType, new L.LatLng(props.coordinates.lat, lon));
    };

    const { iconClassName, label } = getCoordinateSpecificData(props.locationType, props.nodeType);

    return (
        <div className={s.nodeCoordinatesView}>
            <div className={s.nodeCoordinatesHeader}>
                {label}
                <div className={classnames(s.labelIcon, iconClassName)}/>
            </div>
            <div className={s.coordinatesInputs}>
                <InputContainer
                    value={props.coordinates.lat}
                    onChange={latChange}
                    label={'Latitude'}
                    disabled={props.isEditingDisabled}
                />
                <InputContainer
                    value={props.coordinates.lng}
                    onChange={lonChange}
                    label={'Longitude'}
                    disabled={props.isEditingDisabled}
                />
            </div>
        </div>
    );
};

export default nodeCoordinatesView;
