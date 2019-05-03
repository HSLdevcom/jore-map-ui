import { render, unmountComponentAtNode } from 'react-dom';
import { MapControl, MapControlProps, withLeaflet } from 'react-leaflet';
import React from 'react';
import DivControl from './DivControl';

// Custom control wrapper
// Based on React-Leaflet-Customer-Control
// https://www.npmjs.com/package/@skyeer/react-leaflet-custom-control

declare module 'react-leaflet' {
    let withLeaflet: any;
}

interface IControlProps extends MapControlProps {
    children: any;
    position: any;
}

class Control extends MapControl<IControlProps> {
    createLeafletElement({ position }: { position: any }) {
        this.leafletElement = new DivControl({ position });
        return this.leafletElement;
    }

    updateLeafletElement(fromProps: any, toProps: any) {
        super.updateLeafletElement(fromProps, toProps);
        this.renderContent();
    }

    componentDidMount() {
        super.componentDidMount!();
        this.renderContent();
    }

    componentWillUnmount() {
        unmountComponentAtNode(this.leafletElement.getContainer() as Element);
        super.componentWillUnmount!();
    }

    private renderContent() {
        const container = this.leafletElement.getContainer();
        if (container && this.props.children) {
            const { children, ...rest } = this.props;
            render(
                React.cloneElement(children, {
                    ...rest
                }),
                container
            );
        }
    }
}

export default withLeaflet(Control);
