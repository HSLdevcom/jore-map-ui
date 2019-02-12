import React from 'react';
import { INode } from '~/models';
import NodeLocationType from '~/types/NodeLocationType';
import NodeCoordinatesView from './NodeCoordinatesView';
import * as s from './nodeCoordinatesListView.scss';

interface INodeCoordinatesListView {
    node: INode;
    isEditingDisabled: boolean;
    onChangeCoordinates: (coordinatesType: NodeLocationType) => (coordinates: L.LatLng) => void;
}

const nodeCoordinatesListView = (props: INodeCoordinatesListView) => {
    return (
        <div className={s.nodeCoordinatesListView}>
            <NodeCoordinatesView
                nodeType={props.node.type}
                locationType='coordinates'
                coordinates={props.node.coordinates}
                onChangeCoordinates={props.onChangeCoordinates('coordinates')}
                isEditingDisabled={props.isEditingDisabled}
            />
            <NodeCoordinatesView
                nodeType={props.node.type}
                locationType='coordinatesManual'
                coordinates={props.node.coordinatesManual}
                onChangeCoordinates={props.onChangeCoordinates('coordinatesManual')}
                isEditingDisabled={props.isEditingDisabled}
            />
            <NodeCoordinatesView
                nodeType={props.node.type}
                locationType='coordinatesProjection'
                coordinates={props.node.coordinatesProjection}
                onChangeCoordinates={props.onChangeCoordinates('coordinatesProjection')}
                isEditingDisabled={props.isEditingDisabled}
            />
        </div>
    );
};

export default nodeCoordinatesListView;
