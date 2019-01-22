import React from 'react';
import { ICoordinates, INode } from '~/models';
import NodeCoordinatesView from './NodeCoordinatesView';
import { CoordinatesType } from '../../nodeView/NodeView';
import * as s from './nodeCoordinatesListView.scss';

interface INodeCoordinatesView {
    node:INode;
    onChangeCoordinates: (coordinatesType: CoordinatesType) => (coordinates: ICoordinates) => void;
}

const nodeCoordinatesListView = ({ node, onChangeCoordinates }: INodeCoordinatesView) => {
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
