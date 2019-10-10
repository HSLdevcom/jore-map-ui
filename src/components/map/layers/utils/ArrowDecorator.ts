import L, { LatLng, PolylineDecorator } from 'leaflet';
import { withLeaflet, Path, PathProps } from 'react-leaflet';
import { LeafletContext } from '../../Map';

interface IArrowDecoratorProps extends PathProps {
    leaflet: LeafletContext;
    geometry: LatLng[];
    onClick?: () => void;
    onMouseOver?: () => void;
    onMouseOut?: () => void;
    color: string;
    showOnEventName: string;
    hideOnEventName: string;
    isUpdatePrevented?: boolean;
}

class ArrowDecorator extends Path<IArrowDecoratorProps, PolylineDecorator> {
    createLeafletElement(props: IArrowDecoratorProps) {
        const decorator = new PolylineDecorator(this.props.geometry, {
            patterns: [
                {
                    repeat: 120,
                    offset: 20,
                    endOffset: 30,
                    symbol: L.Symbol.arrowHead({
                        pixelSize: 12,
                        pathOptions: {
                            color: props.color,
                            fillOpacity: 1,
                            fillColor: '#FFF',
                            opacity: 1,
                            fill: true
                        }
                    })
                }
            ]
        });
        if (this.props.onClick) {
            decorator.on('click', this.props.onClick);
        }
        if (this.props.onMouseOver) {
            decorator.on('mouseover', this.props.onMouseOver);
        }
        if (this.props.onMouseOut) {
            decorator.on('mouseout', this.props.onMouseOut);
        }
        if (props.showOnEventName) {
            this.props.leaflet.map!.on(props.showOnEventName, () =>
                this.leafletElement.addTo(props.leaflet.map!)
            );
        }
        if (props.hideOnEventName) {
            this.props.leaflet.map!.on(props.hideOnEventName, () =>
                this.leafletElement.removeFrom(props.leaflet.map!)
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
        this.layerContainer.addLayer(this.leafletElement);
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
