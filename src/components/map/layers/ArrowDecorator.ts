import { Path, PathProps, withLeaflet } from 'react-leaflet';
import L, { PolylineDecorator, LatLng } from 'leaflet';
import { LeafletContext } from '../Map';

interface IArrowDecoratorProps extends PathProps {
    leaflet: LeafletContext;
    geometry: LatLng[];
    onClick?: () => void;
    color: string;
    showOnEventName: string;
    hideOnEventName: string;
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
        if (props.showOnEventName) {
            this.props.leaflet.map!.on(
                props.showOnEventName,
                () => this.leafletElement.removeFrom(props.leaflet.map!),
            );
        }
        if (props.hideOnEventName) {
            this.props.leaflet.map!.on(
                props.hideOnEventName,
                () => this.leafletElement.addTo(props.leaflet.map!),
            );
        }
        return decorator;
    }

    updateLeafletElement(fromProps: IArrowDecoratorProps, toProps: IArrowDecoratorProps) {
        this.leafletElement.removeFrom(toProps.leaflet.map!);
        this.leafletElement = this.createLeafletElement(toProps);
        this.layerContainer.addLayer(
            this.leafletElement,
        );
    }

    componentWillUnmount() {
        if (this.props.showOnEventName) {
            this.props.leaflet.map!.off(this.props.showOnEventName);
        }
        if (this.props.hideOnEventName) {
            this.props.leaflet.map!.off(this.props.hideOnEventName);
        }
        this.leafletElement.removeFrom(this.props.leaflet.map!);
    }
}

export default withLeaflet(ArrowDecorator);
