import L from 'leaflet';
import 'leaflet.vectorgrid';
import { GridLayer, GridLayerProps, withLeaflet } from 'react-leaflet';
import TransitType from '~/enums/transitType';

declare module 'leaflet' {
    let vectorGrid: any;
}

interface IVectorGridLayerProps extends GridLayerProps {
    selectedTransitTypes: TransitType[];
    url: string;
    tms: boolean;
    vectorTileLayerStyles: any;
    onClick?: Function;
}

class VectorGridLayer extends GridLayer<IVectorGridLayerProps> {
    createLeafletElement(props: IVectorGridLayerProps): any {
        const { url, ...options } = props;
        options.tms = true;

        const gridLayer = L.vectorGrid.protobuf(url, options);

        gridLayer.on('click', (event: any) => {
            if (this.props.onClick) {
                this.props.onClick(event);
            }
        });

        return gridLayer;
    }

    private areArraysEqual(arr1: string[], arr2: string[]) {
        const array1 = arr1.sort();
        const array2 = arr2.sort();
        return array1.length === array2.length && array1.slice().every((value, index) => {
            return value === array2.slice()[index];
        });
    }

    updateLeafletElement(fromProps: IVectorGridLayerProps, toProps: IVectorGridLayerProps) {
        super.updateLeafletElement(fromProps, toProps);
        if (!this.areArraysEqual(fromProps.selectedTransitTypes, toProps.selectedTransitTypes)) {
            this.leafletElement.redraw();
        }
    }
}

export default withLeaflet(VectorGridLayer);
