import React, { Component } from 'react';
import { INode } from '~/models';
import Loader from '~/components/shared/loader/Loader';
import * as s from './neighbourNodeInfo.scss';

interface INeighbourNodeInfoProps {
    node: INode;
}

interface INeighbourNodeInfoState {
    routePaths: string[];
    fetched: boolean;
}

class NeighbourNodeInfo extends Component<INeighbourNodeInfoProps, INeighbourNodeInfoState> {
    constructor(props: INeighbourNodeInfoProps) {
        super(props);

        this.state = {
            routePaths: [],
            fetched: false,
        };
    }

    private fetch = () => {
        this.setState({
            routePaths: [
                'Route 1',
                'Route 2',
                'Route 3',
            ],
            fetched: true,
        });
    }

    private renderListObjects = () => {
        return this.state.routePaths.map(rp => (
            <li>
                {rp}
            </li>
        ));
    }

    componentDidMount() {
        setTimeout(this.fetch, 1500);
    }

    render() {
        return (
            <div className={s.neighbourNodeInfoView}>
                { this.state.fetched ?
                    <ul>
                        {this.renderListObjects()}
                    </ul>
                    :
                    <Loader />
                }

            </div>
        );
    }
}

export default NeighbourNodeInfo;
