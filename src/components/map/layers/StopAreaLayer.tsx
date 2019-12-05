import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import { IStopItem } from '~/models/IStop';
import { StopAreaStore } from '~/stores/stopAreaStore';
// import NodeMarker from './markers/NodeMarker';

interface IStopAreaLayerProps {
    stopAreaStore?: StopAreaStore;
}

@inject('stopAreaStore')
@observer
export default class StopAreaLayer extends Component<IStopAreaLayerProps> {
    render() {
        const stopItems = this.props.stopAreaStore!.stopItems;
        return stopItems.map((stopItem: IStopItem) => {
            // <NodeMarker
            //     key={node.id}
            //     isDraggable={this.props.loginStore!.hasWriteAccess}
            //     isSelected={isNewNodeView || this.props.mapStore!.selectedNodeId === node.id}
            //     node={node}
            //     onMoveMarker={this.onMoveMarker()}
            // />
        });
    }
}
