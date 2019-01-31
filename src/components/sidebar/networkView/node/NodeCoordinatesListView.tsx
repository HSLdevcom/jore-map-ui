import React from 'react';
import { INode } from '~/models';
import NodeLocationType from '~/types/NodeLocationType';
import NodeCoordinatesView from './NodeCoordinatesView';
import * as s from './nodeCoordinatesListView.scss';

interface INodeCoordinatesListView {
    node:INode;
    onChangeCoordinates: (coordinatesType: NodeLocationType, coordinates: L.LatLng) => void;
}

const nodeCoordinatesListView = ({ node, onChangeCoordinates }: INodeCoordinatesListView) => {
    return (
        <div className={s.nodeCoordinatesListView}>
            <NodeCoordinatesView
                nodeType={node.type}
                locationType='coordinates'
                coordinates={node.coordinates}
                onChangeCoordinates={onChangeCoordinates}
            />
            <NodeCoordinatesView
                nodeType={node.type}
                locationType='coordinatesManual'
                coordinates={node.coordinatesManual}
                onChangeCoordinates={onChangeCoordinates}
            />
            <NodeCoordinatesView
                nodeType={node.type}
                locationType='coordinatesProjection'
                coordinates={node.coordinatesProjection}
                onChangeCoordinates={onChangeCoordinates}
            />
        </div>
    );
};

export default nodeCoordinatesListView;
