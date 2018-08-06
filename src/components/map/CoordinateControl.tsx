import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { MapStore } from '../../stores/mapStore';

interface ICoordinateControlProps {
    mapStore?: MapStore;
}

@inject('mapStore')
@observer
class CoordinateControl extends React.Component<ICoordinateControlProps> {

    public render() {

        return (
            <div>
                Jotain
            </div>
        );
    }
}

export default CoordinateControl;
