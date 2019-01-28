import React from 'react';
import { INode } from '~/models';
import NodeLocationType from '~/enums/nodeLocationType';
import NodeCoordinatesView from './NodeCoordinatesView';
import { CoordinatesType } from '../../nodeView/NodeView';
import * as s from './nodeCoordinatesListView.scss';

interface INodeCoordinatesListView {
    node:INode;
    onChangeCoordinates: (coordinatesType: CoordinatesType) => (coordinates: L.LatLng) => void;
}

const nodeCoordinatesListView = ({ node, onChangeCoordinates }: INodeCoordinatesListView) => {
    return (
        <div className={s.nodeCoordinatesListView}>
            <NodeCoordinatesView
                nodeType={node.type}
                locationType={NodeLocationType.Measured}
                coordinates={node.coordinates}
                onChangeCoordinates={onChangeCoordinates('coordinates')}
            />
            <NodeCoordinatesView
                nodeType={node.type}
                locationType={NodeLocationType.Manual}
                coordinates={node.coordinatesManual}
                onChangeCoordinates={onChangeCoordinates('coordinatesManual')}
            />
            <NodeCoordinatesView
                nodeType={node.type}
                locationType={NodeLocationType.Projected}
                coordinates={node.coordinatesProjection}
                onChangeCoordinates={onChangeCoordinates('coordinatesProjection')}
            />
        </div>
    );
};

export default nodeCoordinatesListView;
