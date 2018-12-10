import L from 'leaflet';
import 'leaflet.vectorgrid';
import _ from 'lodash';
import { GridLayer, GridLayerProps, withLeaflet } from 'react-leaflet';
import TransitType from '~/enums/transitType';
import { NodeSize } from '~/stores/networkStore';

declare module 'leaflet' {
    let vectorGrid: any;
}

interface IVectorGridLayerProps extends GridLayerProps {
    selectedTransitTypes: TransitType[];
    url: string;
    tms: boolean;
    vectorTileLayerStyles: any;
    nodeSize?: NodeSize;
    onClick?: Function;
}

class VectorGridLayer extends GridLayer<IVectorGridLayerProps> {
    createLeafletElement(props: IVectorGridLayerProps): any {
        const { url, ...options } = props;
        options.tms = true;

        const gridLayer = L.vectorGrid.protobuf(url, options);

        gridLayer.on('click', (event: L.LeafletEvent) => {
            if (this.props.onClick) {
                this.props.onClick(event);
            }
        });

        return gridLayer;
    }

    private areArraysEqual(array1: string[], array2: string[]) {
        return _.isEqual(array1.slice().sort(), array2.slice().sort());
    }

    updateLeafletElement(fromProps: IVectorGridLayerProps, toProps: IVectorGridLayerProps) {
        super.updateLeafletElement(fromProps, toProps);
        // TODO: consider passing a single value "shouldUpdate" and
        // redraw layers according to that variable
        if (!this.areArraysEqual(fromProps.selectedTransitTypes, toProps.selectedTransitTypes)
        || fromProps.nodeSize !== toProps.nodeSize) {
            this.leafletElement.redraw();
        }
    }
}

export default withLeaflet(VectorGridLayer);
