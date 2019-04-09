import * as L from 'leaflet';
import './markerPopup.css';

const _getParent = (element: any, className: string) => {
    if (!element) return false;
    let parent = element.parentNode;
    while (parent != null) {
        if (parent.className && L.DomUtil.hasClass(parent, className)) {
            return parent;
        }
        parent = parent.parentNode;
    }
    return false;
};

class MarkerPopup {
    static initPopup(content: string, markerRef: any) {
        let timeout: any;
        if (markerRef.current) {
            const leafletMarker = markerRef.current.leafletElement;

            const _popupMouseOut = (e: any) => {
                if (markerRef.current) {
                    const leafletMarker = markerRef.current.leafletElement;
                    // detach the event
                    L.DomEvent.off(leafletMarker._popup, 'mouseout', _popupMouseOut, this);

                    // get the element that the mouse hovered onto
                    const target = e.toElement || e.relatedTarget;
                    // check to see if the element is a popup or a marker
                    if (
                        _getParent(target, 'leaflet-popup') ||
                        _getParent(target, 'leaflet-marker-icon')
                    ) {
                        return;
                    }

                    // hide the popup
                    leafletMarker.closePopup();
                }
            };

            // Bind popup to marker
            L.Marker.prototype.bindPopup.apply(
                leafletMarker,
                [
                    content,
                    {
                        showOnMouseOver: true,
                        closeButton: false,
                        offset: [0, -10],
                    }]);

            // Remove default listener that opens popup on click
            leafletMarker.off('click', leafletMarker.openPopup, leafletMarker);

            // Bind to mouse over
            leafletMarker.on(
                'mouseover',
                (e: any) => {
                    // get the element that the mouse hovered onto
                    const target = e.originalEvent.fromElement || e.originalEvent.relatedTarget;
                    const parent = _getParent(target, 'leaflet-popup');

                    // check to see if the element is a popup, and if it is this marker's popup
                    if (parent === leafletMarker._popup._container) {
                        return;
                    }

                    timeout && clearTimeout(timeout);
                    timeout = setTimeout(
                        () => {
                            leafletMarker.openPopup();
                        },
                        500,
                    );
                },
                this,
            );

            // Bind to mouse out
            leafletMarker.on(
                'mouseout',
                (e: any) => {
                    // get the element that the mouse hovered onto
                    const target = e.originalEvent.toElement || e.originalEvent.relatedTarget;

                    // check to see if the element is a popup
                    if (
                        _getParent(target, 'leaflet-popup') ||
                        _getParent(target, 'leaflet-marker-icon')
                        ) {
                        L.DomEvent.on(
                            leafletMarker._popup._container,
                            'mouseout',
                            _popupMouseOut,
                            leafletMarker,
                        );
                        return;
                    }

                    // hide the popup
                    timeout && clearTimeout(timeout);
                    leafletMarker.closePopup();
                },
                this,
            );
        }
    }
}

export default MarkerPopup;
