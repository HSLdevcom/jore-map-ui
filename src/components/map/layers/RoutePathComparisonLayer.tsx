import L from 'leaflet';
import { isEqual } from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { useEffect } from 'react';
import { Polyline } from 'react-leaflet';
import { INode, IRoutePath, IRoutePathLink } from '~/models';
import { MapStore } from '~/stores/mapStore';
import { RoutePathComparisonStore } from '~/stores/routePathComparisonStore';
import NodeUtils from '~/utils/NodeUtils';
import NodeMarker from './markers/NodeMarker';
import * as s from './routePathComparisonLayer.scss';

interface IRoutePathComparisonLayerProps {
    routePathComparisonStore?: RoutePathComparisonStore;
    mapStore?: MapStore;
}

enum ROUTE_PATH_TYPE {
    ROUTE_PATH_1 = 1,
    ROUTE_PATH_2 = 2,
}

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
            type,
        }: {
            routePathToRender: IRoutePath;
            routePathToCompare: IRoutePath;
            type: ROUTE_PATH_TYPE;
        }) => {
            return routePathToRender.routePathLinks.map((rpLink, index) => {
                const renderRoutePathNode = ({
                    node,
                    nodeType,
                }: {
                    node: INode;
                    nodeType: string;
                }) => {
                    const isNodeFound = routePathToCompare.routePathLinks.find(
                        (_rpLink) => _rpLink[nodeType].id === rpLink[nodeType].id
                    );

                    // Prevent rendering duplicate renderRoutePathNode
                    if (isNodeFound && type === ROUTE_PATH_TYPE.ROUTE_PATH_2) {
                        return null;
                    }
                    return (
                        <NodeMarker
                            key={`rpNode-${type}-${node.internalId}`}
                            coordinates={node.coordinates}
                            nodeType={node.type}
                            transitTypes={node.transitTypes ? node.transitTypes : []}
                            fillColorClassName={
                                isNodeFound
                                    ? undefined
                                    : type === ROUTE_PATH_TYPE.ROUTE_PATH_1
                                    ? s.diff1Fill
                                    : s.diff2Fill
                            }
                            nodeLocationType={'coordinates'}
                            nodeId={node.id}
                            isDisabled={false}
                            visibleNodeLabels={props.mapStore!.visibleNodeLabels}
                            shortId={NodeUtils.getShortId(node)}
                            hastusId={node.stop ? node.stop.hastusId : undefined}
                        />
                    );
                };

                const renderRoutePathLink = () => {
                    const rpLinkToCompare = routePathToCompare.routePathLinks.find(
                        (_rpLink: IRoutePathLink, index: number) => {
                            return (
                                _rpLink.startNode.id === rpLink.startNode.id &&
                                _rpLink.endNode.id === rpLink.endNode.id
                            );
                        }
                    );
                    const rpLinkIsDifferent =
                        !rpLinkToCompare ||
                        (rpLinkToCompare && !isEqual(rpLinkToCompare.geometry, rpLink.geometry));

                    // Prevent rendering duplicate renderRoutePathLink
                    if (!rpLinkIsDifferent && type === ROUTE_PATH_TYPE.ROUTE_PATH_2) {
                        return null;
                    }
                    return (
                        <Polyline
                            positions={rpLink.geometry}
                            key={`rpLink-${rpLink.id}`}
                            color={
                                rpLinkIsDifferent
                                    ? type === ROUTE_PATH_TYPE.ROUTE_PATH_1
                                        ? s.diff1Color
                                        : s.diff2Color
                                    : s.commonColor
                            }
                            weight={5}
                            opacity={0.8}
                            interactive={false}
                        />
                    );
                };

                return (
                    <div key={`row-${index}`}>
                        {renderRoutePathNode({ node: rpLink.startNode, nodeType: 'startNode' })}
                        {renderRoutePathLink()}
                        {index === routePathToRender.routePathLinks.length - 1 &&
                            renderRoutePathNode({ node: rpLink.endNode, nodeType: 'endNode' })}
                    </div>
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
                    type: ROUTE_PATH_TYPE.ROUTE_PATH_1,
                })}
                {renderRoutePath({
                    routePathToRender: rp2,
                    routePathToCompare: rp1,
                    type: ROUTE_PATH_TYPE.ROUTE_PATH_2,
                })}
            </div>
        );
    })
);

export default RoutePathComparisonLayer;
