import { Path, PathProps, withLeaflet } from 'react-leaflet';
import L, { PolylineDecorator, LatLng } from 'leaflet';
import { LeafletContext } from '../Map';

interface IArrowDecoratorProps extends PathProps {
    leaflet: LeafletContext;
    geometry: LatLng[];
    onClick: () => void;
    color: string;
}

interface IArrowDecoratorState {}

class ArrowDecorator extends Path<IArrowDecoratorProps, IArrowDecoratorState>{
    createLeafletElement(props: IArrowDecoratorProps) {
        const decorator = new PolylineDecorator(props.geometry, {
            patterns: [
                { repeat: 120, symbol: L.Symbol.arrowHead(
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
        decorator.on('click', this.props.onClick);
        return decorator;
    }
}

export default withLeaflet(ArrowDecorator);
