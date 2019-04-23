import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import {
    RoutePathCopySeqmentStore,
    ICopySeqmentRoutePath,
} from '~/stores/routePathCopySeqmentStore';
import StartMarker from '../mapIcons/StartMarker';
import * as s from './routePathCopySeqmentLayer.scss';

interface IRoutePathCopySeqmentLayerProps {
    routePathCopySeqmentStore?: RoutePathCopySeqmentStore;
}

const START_MARKER_COLOR = '#4286f4';
const END_MARKER_COLOR = '#4286f4';

@inject('routePathCopySeqmentStore')
@observer
class RoutePathCopySeqmentLayer extends Component<IRoutePathCopySeqmentLayerProps> {

    private renderEndMarkerPopupContent = () => {
        const routePaths = this.props.routePathCopySeqmentStore!.routePaths;
        if (routePaths.length === 0) {
            return (
                <div className={s.popupContent}>
                    <div>Kopioitavia reitinsuunnan segmenttejä valitulta väliltä ei
                        löytynyt. Kokeile asettaa pienempi kopioitava väli.</div>
                </div>
            );
        }
        return (
            <div className={s.popupContent}>
                <div className={s.topic}>
                    Kopioitavat reitinsuunnat
                </div>
                <div className={s.routePathList}>
                    { routePaths.map((routePath) => {
                        return this.renderRoutePathRow(routePath);
                    })
                    }
                </div>
            </div>
        );
    }

    private renderRoutePathRow = (routePath: ICopySeqmentRoutePath) => {
        return (
            <div>
                {routePath.routeId}
            </div>
        );
    }

    render() {
        const startNode = this.props.routePathCopySeqmentStore!.startNode;
        const endNode = this.props.routePathCopySeqmentStore!.endNode;
        return (
            <>
                { startNode &&
                    <StartMarker
                        latLng={startNode!.geometry}
                        color={START_MARKER_COLOR}
                    />
                }
                { endNode &&
                    <StartMarker
                        latLng={endNode!.geometry}
                        color={END_MARKER_COLOR}
                        popupContent={this.renderEndMarkerPopupContent()}
                    />
                }
            </>
        );
    }
}

export default RoutePathCopySeqmentLayer;
