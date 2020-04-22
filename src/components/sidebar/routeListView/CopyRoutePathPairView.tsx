import { inject, observer } from 'mobx-react';
import React from 'react';
import { CopyRoutePathPairStore } from '~/stores/copyRoutePathPairStore';
import * as s from './copyRoutePathPairView.scss';

interface ICopyRoutePathPairViewProps {
    copyRoutePathPairStore?: CopyRoutePathPairStore;
}

@inject('copyRoutePathPairStore')
@observer
class CopyRoutePathPairView extends React.Component<ICopyRoutePathPairViewProps> {
    render() {
        const copyRoutePathPairStore = this.props.copyRoutePathPairStore!;
        const lineId = copyRoutePathPairStore.lineId;
        const routeId = copyRoutePathPairStore.routeId;
        return (
            <div className={s.copyRoutePathPairView}>
                Kopioi reitinsuunta pari linjan {lineId} reitille {routeId}
            </div>
        );
    }
}

export default CopyRoutePathPairView;
