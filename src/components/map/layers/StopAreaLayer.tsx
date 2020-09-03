import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import NodeType from '~/enums/nodeType';
import { IStopItem } from '~/models/IStop';
import { MapStore } from '~/stores/mapStore';
import { StopAreaStore } from '~/stores/stopAreaStore';
import NodeMarker from './markers/NodeMarker';

interface IStopAreaLayerProps {
    stopAreaStore?: StopAreaStore;
    mapStore?: MapStore;
}

@inject('stopAreaStore', 'mapStore')
@observer
class StopAreaLayer extends Component<IStopAreaLayerProps> {
    render() {
        const stopItems = this.props.stopAreaStore!.stopItems;
        return stopItems.map((stopItem: IStopItem, index: number) => {
            return (
                <NodeMarker
                    key={`${stopItem.stopAreaId}-${index}`}
                    color={'#007ac9'}
                    coordinates={stopItem.coordinates!}
                    visibleNodeLabels={this.props.mapStore!.visibleNodeLabels}
                    nodeType={NodeType.STOP}
                    transitTypes={[]}
                    nodeLocationType={'coordinates'}
                    nodeId={stopItem.nodeId}
                />
            );
        });
    }
}

export default StopAreaLayer;
