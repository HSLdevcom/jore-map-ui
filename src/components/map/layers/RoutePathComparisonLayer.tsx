import L from 'leaflet';
import { isEqual } from 'lodash';
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
const ROUTE_PATH_1_LINK_DIFFERENCE_COLOR = '#c90000';
const ROUTE_PATH_2_LINK_DIFFERENCE_COLOR = '#65c300';

const RoutePathComparisonLayer = inject(
    'routePathComparisonStore',
    'mapStore'
)(
    observer((props: IRoutePathComparisonLayerProps) => {
        const rp1 = props.routePathComparisonStore!.routePath1;
        const rp2 = props.routePathComparisonStore!.routePath2;

        const renderRoutePath = ({
            routePathToRender,
            routePathToCompare,
            differencesVisualizationColor,
        }: {
            routePathToRender: IRoutePath;
            routePathToCompare: IRoutePath;
            differencesVisualizationColor: string;
        }) => {
            return routePathToRender.routePathLinks.map((rpLink) => {
                const rpLinkToCompare = routePathToCompare.routePathLinks.find((_rpLink) => {
                    return (
                        _rpLink.startNode.id === rpLink.startNode.id &&
                        _rpLink.endNode.id === rpLink.endNode.id
                    );
                });
                const rpLinkIsDifferent =
                    !rpLinkToCompare ||
                    (rpLinkToCompare && !isEqual(rpLinkToCompare.geometry, rpLink.geometry));
                return (
                    <Polyline
                        positions={rpLink.geometry}
                        key={`rpLink-${rpLink.id}`}
                        color={
                            rpLinkIsDifferent ? differencesVisualizationColor : DEFAULT_LINK_COLOR
                        }
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
                {renderRoutePath({
                    routePathToRender: rp1,
                    routePathToCompare: rp2,
                    differencesVisualizationColor: ROUTE_PATH_1_LINK_DIFFERENCE_COLOR,
                })}
                {renderRoutePath({
                    routePathToRender: rp2,
                    routePathToCompare: rp1,
                    differencesVisualizationColor: ROUTE_PATH_2_LINK_DIFFERENCE_COLOR,
                })}
            </div>
        );
    })
);

export default RoutePathComparisonLayer;
