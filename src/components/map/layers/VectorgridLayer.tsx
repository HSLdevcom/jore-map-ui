import L from 'leaflet';
require('leaflet.vectorgrid/dist/Leaflet.VectorGrid.bundled.js');
import { GridLayer, GridLayerProps, withLeaflet } from 'react-leaflet';

declare module 'leaflet' {
    let vectorGrid: any;
}

interface IVectorGridLayerProps extends GridLayerProps {
    url: string;
    tms: boolean;
}

class VectorgridLayer extends GridLayer<IVectorGridLayerProps> {
    createLeafletElement(props: IVectorGridLayerProps):
        any {
        const { url, ...options } = props;
        options.tms = true;

        return L.vectorGrid.protobuf(url, options);
    }

    updateLeafletElement(fromProps: IVectorGridLayerProps, toProps: IVectorGridLayerProps) {
        super.updateLeafletElement(fromProps, toProps);
        if (toProps.url !== fromProps.url) {
            this.leafletElement['vectorGrid'].protobuf(toProps.url);
        }
    }
}

export default withLeaflet(VectorgridLayer);
