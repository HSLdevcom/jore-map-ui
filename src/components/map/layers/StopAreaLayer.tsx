import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import NodeType from '~/enums/nodeType';
import { IStopItem } from '~/models/IStop';
import { StopAreaStore } from '~/stores/stopAreaStore';
import NodeMarker from './markers/NodeMarker';

interface IStopAreaLayerProps {
    stopAreaStore?: StopAreaStore;
}

@inject('stopAreaStore')
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
                    nodeType={NodeType.STOP}
                    isSelected={false}
                    nodeLocationType={'coordinates'}
                />
            );
        });
    }
}

export default StopAreaLayer;
