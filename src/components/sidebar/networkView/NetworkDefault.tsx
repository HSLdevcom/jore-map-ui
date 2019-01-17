import * as React from 'react';
import * as s from './networkView.scss';

interface INetworkViewProps {
}

class NetworkDefault extends React.Component<INetworkViewProps> {
    constructor(props: INetworkViewProps) {
        super(props);
    }

    public render() {
        return (
            <div className={s.networkView}>
                <h2>Verkon muokkaus</h2>
                <p>TODO: Search functionality</p>
            </div>
        );
    }
}

export default NetworkDefault;
