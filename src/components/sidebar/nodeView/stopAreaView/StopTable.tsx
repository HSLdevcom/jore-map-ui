import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import Loader, { LoaderSize } from '~/components/shared/loader/Loader';
import { IStopArea } from '~/models';
import StopService, { IStopItem } from '~/services/stopService';
import { StopAreaStore } from '~/stores/stopAreaStore';
import * as s from './stopTable.scss';

interface IStopTableProps {
    stopArea: IStopArea;
    stopAreaStore?: StopAreaStore;
}

interface IStopTableState {
    isLoading: boolean;
}
@inject('stopAreaStore')
@observer
export default class StopTable extends Component<IStopTableProps, IStopTableState> {
    private mounted: boolean;
    constructor(props: IStopTableProps) {
        super(props);
        this.state = {
            isLoading: true
        };
    }

    async componentDidMount() {
        this.mounted = true;

        const stopItems: IStopItem[] = await StopService.fetchAllStops();
        this.props.stopAreaStore!.setStopItems(stopItems);
        if (this.mounted) {
            this.setState({
                isLoading: false
            });
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    private getStopsByStopAreaId = (stopAreaId: string | undefined) => {
        if (!stopAreaId) return [];
        const stopItems = this.props.stopAreaStore!.stopItems;
        const stopsByStopAreaId = stopItems.filter(stopItem => {
            return stopItem.stopAreaId === stopAreaId;
        });
        return stopsByStopAreaId;
    };

    private renderStopsByStopArea = (stopItems: IStopItem[]) => {
        return stopItems.map((stopItem: IStopItem, index: number) => {
            return (
                <tr key={index} className={s.stopTableRow}>
                    <td>{stopItem.nodeId}</td>
                    <td>{stopItem.nameFi}</td>
                    <td>{stopItem.nameSw}</td>
                </tr>
            );
        });
    };

    render() {
        const stopArea = this.props.stopArea;
        if (this.state.isLoading) {
            return (
                <div className={classnames(s.stopTableView, s.loaderContainer)}>
                    <Loader size={LoaderSize.SMALL} />
                </div>
            );
        }
        if (!stopArea) return null;

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
