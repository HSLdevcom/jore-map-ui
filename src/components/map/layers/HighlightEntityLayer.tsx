import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { CircleMarker, Polyline } from 'react-leaflet';
import { ILinkMapHighlight } from '~/models/ILink';
import { INodeMapHighlight } from '~/models/INode';
import { HighlightEntityStore } from '~/stores/highlightEntityStore';

interface IHighlightEntityLayerProps {
    highlightEntityStore?: HighlightEntityStore;
}

const YELLOW = '#f7e200';

@inject('highlightEntityStore')
@observer
export default class HighlightEntityLayer extends Component<IHighlightEntityLayerProps> {
    private renderNodes = () => {
        const nodes = this.props.highlightEntityStore!.nodes;
        return nodes.map((node: INodeMapHighlight, index: number) => (
            <CircleMarker
                pane={'highlightEntityLayer'}
                key={`nodeHighlight-${index}`}
                center={node.coordinates}
                stroke={true}
                color={YELLOW}
                opacity={1}
                fillOpacity={1}
                fillColor={YELLOW}
                radius={3}
            />
        ));
    };

    private renderLinks = () => {
        const links = this.props.highlightEntityStore!.links;
        return links.map((link: ILinkMapHighlight, index: number) => (
            <Polyline
                positions={link.geometry}
                key={`linkHighlight-${index}`}
                color={YELLOW}
                weight={5}
            />
        ));
    };

    render() {
        return (
            <>
                {this.renderNodes()}
                {this.renderLinks()}
            </>
        );
    }
}
