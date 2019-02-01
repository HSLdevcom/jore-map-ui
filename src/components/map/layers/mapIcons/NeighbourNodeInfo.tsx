import React, { Component } from 'react';
import { INode } from '~/models';
import { dateToDateString } from '~/util/dateFormatHelper';
import Loader, { LoaderSize } from '~/components/shared/loader/Loader';
import * as s from './neighbourNodeInfo.scss';

interface INeighbourNodeInfoProps {
    node: INode;
}

interface IMockRoutePath {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    direction: number;
}

interface INeighbourNodeInfoState {
    routePaths: IMockRoutePath[];
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
                {
                    id: '0033',
                    direction: 1,
                    startDate: new Date('02.08.2009'),
                    endDate: new Date('09.15.2050'),
                    name: 'Kaivoksela-Vantaankoski',
                },
                {
                    id: '0035',
                    direction: 1,
                    startDate: new Date('10.12.2018'),
                    endDate: new Date('01.12.2028'),
                    name: 'Martinlaakso - Askisto',
                },
                {
                    id: '0039',
                    direction: 2,
                    startDate: new Date('09.02.2015'),
                    endDate: new Date('05.05.2050'),
                    name: '',
                },
                {
                    id: '0052',
                    direction: 1,
                    startDate: new Date('12.12.2018'),
                    endDate: new Date('01.09.2018'),
                    name: 'Martinlaakso - Askisto',
                },
            ],
            fetched: true,
        });
    }

    private renderListObjects = () => {
        return this.state.routePaths.map(rp => (
            <div className={s.item}>
                <div>
                    {rp.id}
                </div>
                <div>
                    {rp.direction.toString()}
                </div>
                <div>
                    {`${dateToDateString(rp.startDate)}-${dateToDateString(rp.endDate)}`}
                </div>
            </div>
        ));
    }

    componentDidMount() {
        setTimeout(this.fetch, 1500);
    }

    render() {
        return (
            <div className={s.neighbourNodeInfoView}>
                { this.state.fetched ?
                    <div className={s.content}>
                        <div className={s.header}>
                            {this.props.node.id}
                        </div>
                        {this.renderListObjects()}
                    </div>
                    :
                    <div className={s.loaderContainer}>
                        <Loader size={LoaderSize.TINY}/>
                    </div>
                }

            </div>
        );
    }
}

export default NeighbourNodeInfo;
