import classnames from 'classnames';
import * as L from 'leaflet';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import Loader, { LoaderSize } from '~/components/shared/loader/Loader';
import { IStopArea } from '~/models';
import StopService, { IStopItem } from '~/services/stopService';
import { MapStore } from '~/stores/mapStore';
import { StopAreaStore } from '~/stores/stopAreaStore';
import * as s from './stopTable.scss';

interface IStopTableProps {
    stopArea: IStopArea;
    mapStore?: MapStore;
    stopAreaStore?: StopAreaStore;
}

interface IStopTableState {
    isLoading: boolean;
}
@inject('mapStore', 'stopAreaStore')
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

        const stopItems: IStopItem[] = await StopService.fetchAllStopItemsByStopAreaId(
            this.props.stopArea.id
        );
        this.props.stopAreaStore!.setStopItems(stopItems);

        this.centerMapToStopAreas(stopItems);
        if (this.mounted) {
            this.setState({
                isLoading: false
            });
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    private centerMapToStopAreas = (stopItems: IStopItem[]) => {
        const mapStore = this.props.mapStore;
        mapStore!.setIsMapCenteringPrevented(false);
        if (stopItems.length === 0) {
            mapStore!.initCoordinates();
            return;
        }

        const latLngs: L.LatLng[] = stopItems.map(iterator => iterator.coordinates!);
        const bounds = L.latLngBounds(latLngs);
        mapStore!.setMapBounds(bounds);
    };

    private centerMapToStopItem = (stopItem: IStopItem) => {
        this.props.mapStore!.setCoordinates(stopItem.coordinates!);
    };

    render() {
        if (this.state.isLoading) {
            return (
                <div className={classnames(s.stopTableView, s.loaderContainer)}>
                    <Loader size={LoaderSize.SMALL} />
                </div>
            );
        }
        const stopItems = this.props.stopAreaStore!.stopItems;
        return (
            <div className={s.stopTableView}>
                <div className={s.sectionHeader}>Pysäkkialueen pysäkit</div>
                <div className={s.flexRow}>
                    {stopItems.length > 0 ? (
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
                                {stopItems.map((stopItem: IStopItem, index: number) => {
                                    return (
                                        <tr
                                            key={index}
                                            className={s.stopTableRow}
                                            onClick={() => this.centerMapToStopItem(stopItem)}
                                        >
                                            <td>{stopItem.nodeId}</td>
                                            <td>{stopItem.nameFi}</td>
                                            <td>{stopItem.nameSw}</td>
                                        </tr>
                                    );
                                })}
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
