import { Path, PathProps, withLeaflet } from 'react-leaflet';
import L, { PolylineDecorator, LatLng } from 'leaflet';
import { LeafletContext } from '../Map';

interface IArrowDecoratorProps extends PathProps {
    leaflet: LeafletContext;
    geometry: LatLng[];
    onClick?: () => void;
    color: string;
    disableOnEventName?: string;
    enableOnEventName?: string;
    isUpdatePrevented?: boolean;
}

class ArrowDecorator extends Path<IArrowDecoratorProps, PolylineDecorator>{
    createLeafletElement(props: IArrowDecoratorProps) {
        const decorator = new PolylineDecorator(this.props.geometry, {
            patterns: [
                { repeat: 120, offset: 20, endOffset: 30, symbol: L.Symbol.arrowHead(
                    {
                        pixelSize: 15,
                        pathOptions: {
                            color: props.color,
                            fillOpacity: 1,
                            fillColor: '#FFF',
                            opacity: 1,
                            fill: true,
                        },
                    }),
                },
            ],
        });
        if (this.props.onClick) {
            decorator.on('click', this.props.onClick);
        }
        if (props.disableOnEventName) {
            this.props.leaflet.map!.on(
                props.disableOnEventName,
                () => this.leafletElement.removeFrom(props.leaflet.map!),
            );
        }
        if (props.enableOnEventName) {
            this.props.leaflet.map!.on(
                props.enableOnEventName,
                () => this.leafletElement.addTo(props.leaflet.map!),
            );
        }
        return decorator;
    }

    updateLeafletElement(fromProps: IArrowDecoratorProps, toProps: IArrowDecoratorProps) {
        /**
         * Need to prevent updating in certain situations or else leaflet throws an error
         * For example when highlighting route on/off, this.leafletElement.removeFrom causes
         * leaflet error. That is why this takes an early exit.
        */
        if (this.props.isUpdatePrevented) return;

        this.leafletElement.removeFrom(toProps.leaflet.map!);
        this.leafletElement = this.createLeafletElement(toProps);
        this.layerContainer.addLayer(
            this.leafletElement,
        );
    }

    componentWillUnmount() {
        if (this.props.disableOnEventName) {
            this.props.leaflet.map!.off(this.props.disableOnEventName);
        }
        if (this.props.enableOnEventName) {
            this.props.leaflet.map!.off(this.props.enableOnEventName);
        }
        this.leafletElement.removeFrom(this.props.leaflet.map!);
    }
}

export default withLeaflet(ArrowDecorator);
