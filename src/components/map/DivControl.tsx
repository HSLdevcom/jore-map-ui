import { Control, DomUtil, DomEvent } from 'leaflet';

const divControl : any = Control.extend({
    options: {
    },
    onAdd: () => {
        const container = DomUtil.create('div');
        DomEvent.disableClickPropagation(container);
        return container;
    },
});

export default divControl;
