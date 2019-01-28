import React from 'react';
import { INode } from '~/models';
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
                label={'Mitattu'}
                coordinates={node.coordinates}
                onChangeCoordinates={onChangeCoordinates('coordinates')}
            />
            <NodeCoordinatesView
                label={'Sovitettu'}
                coordinates={node.coordinatesManual}
                onChangeCoordinates={onChangeCoordinates('coordinatesManual')}
            />
            <NodeCoordinatesView
                label={'Projektio'}
                coordinates={node.coordinatesProjection}
                onChangeCoordinates={onChangeCoordinates('coordinatesProjection')}
            />
        </div>
    );
};

export default nodeCoordinatesListView;
