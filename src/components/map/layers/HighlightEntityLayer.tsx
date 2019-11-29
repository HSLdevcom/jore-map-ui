import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { CircleMarker } from 'react-leaflet';
import { INodeMapHighlight } from '~/models/INode';
import { HighlightEntityStore } from '~/stores/highlightEntityStore';

interface IHighlightEntityLayerProps {
    highlightEntityStore?: HighlightEntityStore;
}

const YELLOW = '#f7e200';

@inject('highlightEntityStore')
@observer
export default class HighlightEntityLayer extends Component<IHighlightEntityLayerProps> {
    render() {
        const nodes = this.props.highlightEntityStore!.nodes;
        return nodes.map((node: INodeMapHighlight, index: number) => (
            <CircleMarker
                pane={'highlightEntityLayer'}
                key={`markerHighlight-${index}`}
                center={node.coordinates}
                stroke={true}
                color={YELLOW}
                opacity={1}
                fillOpacity={1}
                fillColor={YELLOW}
                radius={3}
            />
        ));
    }
}
