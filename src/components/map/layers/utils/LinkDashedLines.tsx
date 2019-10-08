import React, { Component } from 'react';
import { Polyline } from 'react-leaflet';
import { INode } from '~/models';

interface ILinkDashedLinesProps {
    geometry: L.LatLng[];
    startNode: INode;
    endNode: INode;
    color: string;
}

class LinkDashedLines extends Component<ILinkDashedLinesProps> {
    private renderDashedLines = ({
        geometry,
        startNode,
        endNode,
        color
    }: ILinkDashedLinesProps) => {
        const startNodeCoordinates = startNode.coordinates;
        const endNodeCoordinates = endNode.coordinates;

        const linkStartCoordinates = geometry[0];
        const linkEndCoordinates = geometry[geometry.length - 1];
        const dashedLines = [];
        if (!startNodeCoordinates.equals(linkStartCoordinates)) {
            dashedLines.push(
                this.renderDashedLine(
                    startNodeCoordinates,
                    linkStartCoordinates,
                    color,
                    `startNodeDashedLine`
                )
            );
        }
        if (!endNodeCoordinates.equals(linkEndCoordinates)) {
            dashedLines.push(
                this.renderDashedLine(
                    endNodeCoordinates,
                    linkEndCoordinates,
                    color,
                    `endNodeDashedLine`
                )
            );
        }
        return dashedLines;
    };

    private renderDashedLine = (
        startCoordinates: L.LatLng,
        endCoordinates: L.LatLng,
        color: string,
        key: string
    ) => {
        return (
            <Polyline
                positions={[startCoordinates, endCoordinates]}
                key={key}
                color={color}
                weight={5}
                opacity={0.75}
                dashArray={'10, 10'}
            />
        );
    };

    render() {
        return this.renderDashedLines(this.props);
    }
}

export default LinkDashedLines;
