import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import NodeLocationType from '~/types/NodeLocationType';
import { NodeStore } from '~/stores/nodeStore';
import NodeType from '~/enums/nodeType';
import NodeCoordinatesView from './NodeCoordinatesView';
import * as s from './nodeCoordinatesListView.scss';

interface INodeCoordinatesListViewProps {
    isEditingDisabled: boolean;
    onChangeCoordinates: (coordinatesType: NodeLocationType) => (coordinates: L.LatLng) => void;
    nodeStore?: NodeStore;
}

@inject('nodeStore')
@observer
class NodeCoordinatesListView extends Component<INodeCoordinatesListViewProps> {
    render() {
        const node = this.props.nodeStore!.node;
        return(
            <div className={s.nodeCoordinatesListView}>
                <NodeCoordinatesView
                    nodeType={node.type}
                    locationType='coordinates'
                    coordinates={node.coordinates}
                    onChangeCoordinates={this.props.onChangeCoordinates('coordinates')}
                    isEditingDisabled={this.props.isEditingDisabled}
                />
                { node.type === NodeType.STOP &&
                    <>
                        <NodeCoordinatesView
                            nodeType={node.type}
                            locationType='coordinatesManual'
                            coordinates={node.coordinatesManual}
                            onChangeCoordinates={
                                this.props.onChangeCoordinates('coordinatesManual')}
                            isEditingDisabled={this.props.isEditingDisabled}
                        />
                        <NodeCoordinatesView
                            nodeType={node.type}
                            locationType='coordinatesProjection'
                            coordinates={node.coordinatesProjection}
                            onChangeCoordinates={
                                this.props.onChangeCoordinates('coordinatesProjection')}
                            isEditingDisabled={this.props.isEditingDisabled}
                        />
                    </>
                }
            </div>
        );
    }
}

export default NodeCoordinatesListView;
