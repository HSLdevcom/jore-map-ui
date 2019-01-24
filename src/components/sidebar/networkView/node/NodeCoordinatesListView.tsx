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
            <div className={s.measured}>
                <NodeCoordinatesView
                    label={'Mitattu'}
                    coordinates={node.coordinates}
                    onChangeCoordinates={onChangeCoordinates('coordinates')}
                />
            </div>
            <div className={s.manual}>
                <NodeCoordinatesView
                    label={'Sovitettu'}
                    coordinates={node.coordinatesManual}
                    onChangeCoordinates={onChangeCoordinates('coordinatesManual')}
                />
            </div>
            <div className={s.projection}>
                <NodeCoordinatesView
                    label={'Projektio'}
                    coordinates={node.coordinatesProjection}
                    onChangeCoordinates={onChangeCoordinates('coordinatesProjection')}
                />
            </div>
        </div>
    );
};

export default nodeCoordinatesListView;
