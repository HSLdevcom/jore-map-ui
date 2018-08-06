import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { MapStore } from '../../stores/mapStore';

interface IFullscreenControlProps {
    mapStore?: MapStore;
}

@inject('mapStore')
@observer
class FullscreenControl extends React.Component<IFullscreenControlProps> {

    public render() {

        return (
            <div>
                Jotain
            </div>
        );
    }
}

export default FullscreenControl;
