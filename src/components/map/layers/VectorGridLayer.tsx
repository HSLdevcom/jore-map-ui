import L from 'leaflet';
import 'leaflet.vectorgrid';
import _ from 'lodash';
import { reaction } from 'mobx';
import { GridLayer, GridLayerProps, withLeaflet } from 'react-leaflet';
import { Moment } from 'moment';
import TransitType from '~/enums/transitType';
import { NodeSize } from '~/stores/networkStore';
import EditNetworkStore from '~/stores/editNetworkStore';

declare module 'leaflet' {
    let vectorGrid: any;
}

interface IVectorGridLayerProps extends GridLayerProps {
    selectedTransitTypes: TransitType[];
    selectedDate: Moment;
    url: string;
    tms: boolean;
    vectorTileLayerStyles: any;
    nodeSize?: NodeSize;
    onClick?: Function;
}

class VectorGridLayer extends GridLayer<IVectorGridLayerProps> {
    constructor(props: IVectorGridLayerProps) {
        super(props);
        reaction(() =>
        EditNetworkStore.node,
                 this.redrawLayers,
            );
    }

    // Hiding network nodes / links need refreshing the whole layer
    // TODO: find a better way to achieve this
    private redrawLayers = () => {
        this.leafletElement.redraw();
    }

    createLeafletElement(props: IVectorGridLayerProps): any {
        const { url, ...options } = props;
        options.tms = true;

        return L.vectorGrid.protobuf(url, options);
    }

    private areArraysEqual(array1: string[], array2: string[]) {
        return _.isEqual(array1.slice().sort(), array2.slice().sort());
    }

    updateLeafletElement(fromProps: IVectorGridLayerProps, toProps: IVectorGridLayerProps) {
        super.updateLeafletElement(fromProps, toProps);
        // TODO: consider passing a single value "shouldUpdate"
        // OR even better: pass ref to updateLeafletElement and call from parent
        // redraw layers according to that variable
        if (!this.areArraysEqual(fromProps.selectedTransitTypes, toProps.selectedTransitTypes)
            || fromProps.nodeSize !== toProps.nodeSize
            || (!fromProps.selectedDate !== !toProps.selectedDate ||
                (fromProps.selectedDate
                && toProps.selectedDate
                && !fromProps.selectedDate.isSame(toProps.selectedDate)))) {
            this.leafletElement.redraw();
        }
    }
}

export default withLeaflet(VectorGridLayer);
