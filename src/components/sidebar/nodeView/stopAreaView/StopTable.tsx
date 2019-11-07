import classnames from 'classnames';
import React, { Component } from 'react';
import { IStopArea } from '~/models';
import StopService, { IStopItem } from '~/services/stopService';
import * as s from './stopTable.scss';

interface IStopTableProps {
    stopArea: IStopArea;
}

interface IStopTableState {
    isLoading: boolean;
    stops: IStopItem[];
}

export default class StopTable extends Component<IStopTableProps, IStopTableState> {
    private mounted: boolean;

    constructor(props: IStopTableProps) {
        super(props);
        this.state = {
            isLoading: true,
            stops: []
        };
    }

    async componentDidMount() {
        this.mounted = true;
        const stops: IStopItem[] = await StopService.fetchAllStops();
        if (this.mounted) {
            this.setState({
                stops,
                isLoading: false
            });
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    private getStopsByStopAreaId = (stopAreaId: string | undefined) => {
        if (!stopAreaId) return [];
        const stopsByStopAreaId = this.state.stops.filter(iterable => {
            return iterable.pysalueid === stopAreaId;
        });
        return stopsByStopAreaId;
    };

    private renderStopsByStopArea = (stops: IStopItem[]) => {
        return stops.map((stop: IStopItem, index: number) => {
            return (
                <tr key={index} className={s.stopTableRow}>
                    <td>{stop.soltunnus}</td>
                    <td>{stop.pysnimi}</td>
                    <td>{stop.pysnimir}</td>
                </tr>
            );
        });
    };

    render() {
        const stopArea = this.props.stopArea;
        if (!stopArea || this.state.isLoading) return null;

        const stopsByStopArea = this.getStopsByStopAreaId(stopArea.id);
        return (
            <div className={s.stopTableView}>
                <div className={s.sectionHeader}>Pysäkkialueen pysäkit</div>
                <div className={s.flexRow}>
                    {stopsByStopArea.length > 0 ? (
                        <table className={s.stopHeaderTable}>
                            <tbody>
                                <tr>
                                    <th className={classnames(s.inputLabel, s.columnHeader)}>
                                        SOLMUN TUNNUS
                                    </th>
                                    <th className={classnames(s.inputLabel, s.columnHeader)}>
                                        NIMI SUOMEKSI
                                    </th>
                                    <th className={classnames(s.inputLabel, s.columnHeader)}>
                                        NIMI RUOTSIKSI
                                    </th>
                                    <th className={s.columnHeader} />
                                </tr>
                                {this.renderStopsByStopArea(stopsByStopArea)}
                            </tbody>
                        </table>
                    ) : (
                        <div>Pysäkkialueella ei pysäkkejä.</div>
                    )}
                </div>
            </div>
        );
    }
}
