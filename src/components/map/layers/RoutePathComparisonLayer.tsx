import L from 'leaflet';
import { inject, observer } from 'mobx-react';
import React, { useEffect } from 'react';
import { Polyline } from 'react-leaflet';
import { IRoutePath } from '~/models';
import { MapStore } from '~/stores/mapStore';
import { RoutePathComparisonStore } from '~/stores/routePathComparisonStore';

interface IRoutePathComparisonLayerProps {
    routePathComparisonStore?: RoutePathComparisonStore;
    mapStore?: MapStore;
}

const DEFAULT_LINK_COLOR = '#000';

const RoutePathComparisonLayer = inject(
    'routePathComparisonStore',
    'mapStore'
)(
    observer((props: IRoutePathComparisonLayerProps) => {
        const rp1 = props.routePathComparisonStore!.routePath1;
        const rp2 = props.routePathComparisonStore!.routePath2;

        const renderRoutePath = (routePath: IRoutePath) => {
            return routePath.routePathLinks.map((rpLink) => {
                return (
                    <Polyline
                        positions={rpLink.geometry}
                        key={`rpLink-${rpLink.id}`}
                        color={DEFAULT_LINK_COLOR}
                        weight={5}
                        opacity={0.8}
                        interactive={false}
                    />
                );
            });
        };

        useEffect(() => {
            if (rp1 && rp2) {
                const bounds: L.LatLngBounds = new L.LatLngBounds([]);

                rp1!.routePathLinks.forEach((link) => {
                    link.geometry.forEach((pos) => bounds.extend(pos));
                });
                rp2!.routePathLinks.forEach((link) => {
                    link.geometry.forEach((pos) => bounds.extend(pos));
                });

                props.mapStore!.setMapBounds(bounds);
            }
        }, [rp1, rp2]);

        if (!rp1 || !rp2) {
            return null;
        }
        return (
            <div>
                {renderRoutePath(rp1)}
                {renderRoutePath(rp2)}
            </div>
        );
    })
);

export default RoutePathComparisonLayer;
