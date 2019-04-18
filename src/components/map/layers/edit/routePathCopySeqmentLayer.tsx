import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { RoutePathCopySeqmentStore } from '~/stores/routePathCopySeqmentStore';
import StartMarker from '../mapIcons/StartMarker';

interface IRoutePathCopySeqmentLayerProps {
    routePathCopySeqmentStore?: RoutePathCopySeqmentStore;
}

const START_MARKER_COLOR = '#4286f4';
const END_MARKER_COLOR = '#4286f4';

@inject('routePathCopySeqmentStore')
@observer
class RoutePathCopySeqmentLayer extends Component<IRoutePathCopySeqmentLayerProps> {
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
                    />
                }
            </>
        );
    }
}

export default RoutePathCopySeqmentLayer;
