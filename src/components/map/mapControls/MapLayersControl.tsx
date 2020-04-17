import classnames from 'classnames';
import { observer } from 'mobx-react';
import Moment from 'moment';
import React, { MouseEvent } from 'react';
import { IoMdMap } from 'react-icons/io';
import { Checkbox, TransitToggleButtonBar } from '~/components/controls/';
import InputContainer from '~/components/controls/InputContainer';
import TransitType from '~/enums/transitType';
import MapStore, { MapFilter, NodeLabel } from '~/stores/mapStore';
import NetworkStore, { MapLayer } from '~/stores/networkStore';
import { RadioButton } from '../../controls';
import * as s from './mapLayersControl.scss';

interface IMapLayersControlState {
    selectedMapOption: option;
    show: boolean;
}

interface IMapLayersControlProps {}

enum option {
    MAP = 'Kartta',
    SATELLITE = 'Satelliitti',
    TERRAIN = 'Maasto'
}

@observer
class MapLayersControl extends React.Component<IMapLayersControlProps, IMapLayersControlState> {
    constructor(props: any) {
        super(props);
        this.state = {
            selectedMapOption: option.MAP,
            show: false
        };
    }

    private toggleTransitType = (type: TransitType) => {
        NetworkStore.toggleTransitType(type);
    };

    private toggleMapLayerVisibility = (mapLayer: MapLayer) => () => {
        NetworkStore.toggleMapLayerVisibility(mapLayer);
    };

    private toggleMapFilter = (mapFilter: MapFilter) => () => {
        MapStore.toggleMapFilter(mapFilter);
    };

    private toggleNodeLabelVisibility = (nodeLabel: NodeLabel) => () => {
        MapStore.toggleNodeLabelVisibility(nodeLabel);
    };

    private toggleMapOption = (option: option) => () => {
        this.setState({
            selectedMapOption: option
        });
    };

    private selectDate = (date: Date) => {
        NetworkStore.setSelectedDate(date ? Moment(date) : null);
    };

    private showControls = (show: boolean) => (e: MouseEvent<HTMLDivElement>) => {
        this.setState({ show });
    };

    render() {
        if (!this.state.show) {
            return (
                <div onMouseEnter={this.showControls(true)}>
                    <div className={s.mapLayerControlIcon} data-cy='mapLayerControlIcon'>
                        <IoMdMap />
                    </div>
                </div>
            );
        }

        return (
            <div
                className={classnames(s.mapLayerControlView)}
                onMouseLeave={this.showControls(false)}
                data-cy='mapLayerControlView'
            >
                <div className={s.mapLayersContainer}>
                    <div className={s.inputTitle}>VERKKO</div>
                    <TransitToggleButtonBar
                        toggleSelectedTransitType={this.toggleTransitType}
                        className={s.transitTypeToggleButtonBar}
                        selectedTransitTypes={NetworkStore.selectedTransitTypes}
                    />
                    <InputContainer
                        label={<div className={s.inputTitle}>Tarkkailupäivämäärä</div>}
                        onChange={this.selectDate}
                        type='date'
                        value={
                            NetworkStore.selectedDate
                                ? NetworkStore.selectedDate.toDate()
                                : undefined
                        }
                        isClearButtonVisibleOnDates={true}
                        isEmptyDateValueAllowed={true}
                    />
                    <div className={s.sectionDivider} />
                    <div className={s.inputTitle}>SOLMUT</div>
                    <div className={s.checkboxContainer}>
                        <Checkbox
                            onClick={this.toggleMapLayerVisibility(MapLayer.node)}
                            checked={NetworkStore.isMapLayerVisible(MapLayer.node)}
                            content='Alueen solmut'
                            data-cy='showNodes'
                        />
                    </div>
                    <div className={s.checkboxContainer}>
                        <Checkbox
                            onClick={this.toggleMapLayerVisibility(MapLayer.unusedNode)}
                            checked={NetworkStore.isMapLayerVisible(MapLayer.unusedNode)}
                            content='Käyttämättömät solmut'
                        />
                    </div>
                    <div className={s.checkboxContainer}>
                        <Checkbox
                            onClick={this.toggleNodeLabelVisibility(NodeLabel.hastusId)}
                            checked={MapStore.isNodeLabelVisible(NodeLabel.hastusId)}
                            content='Hastus id'
                        />
                    </div>
                    <div className={s.checkboxContainer}>
                        <Checkbox
                            onClick={this.toggleNodeLabelVisibility(NodeLabel.longNodeId)}
                            checked={MapStore.isNodeLabelVisible(NodeLabel.longNodeId)}
                            content='Pitkä solmun id'
                        />
                    </div>
                    <div className={s.checkboxContainer}>
                        <Checkbox
                            onClick={this.toggleNodeLabelVisibility(NodeLabel.shortNodeId)}
                            checked={MapStore.isNodeLabelVisible(NodeLabel.shortNodeId)}
                            content='Lyhyt solmun id'
                        />
                    </div>
                    <div className={s.sectionDivider} />
                    <div className={s.inputTitle}>LINKIT</div>
                    <div className={s.checkboxContainer}>
                        <Checkbox
                            onClick={this.toggleMapLayerVisibility(MapLayer.link)}
                            checked={NetworkStore.isMapLayerVisible(MapLayer.link)}
                            content='Alueen linkit'
                            data-cy='showLinks'
                        />
                    </div>
                    <div className={s.checkboxContainer}>
                        <Checkbox
                            onClick={this.toggleMapLayerVisibility(MapLayer.unusedLink)}
                            checked={NetworkStore.isMapLayerVisible(MapLayer.unusedLink)}
                            content='Käyttämättömät linkit'
                        />
                    </div>
                    <div className={s.checkboxContainer}>
                        <Checkbox
                            onClick={this.toggleMapFilter(MapFilter.arrowDecorator)}
                            checked={MapStore.isMapFilterEnabled(MapFilter.arrowDecorator)}
                            content='Suuntanuolet'
                        />
                    </div>
                    <div className={s.checkboxContainer}>
                        <Checkbox
                            onClick={this.toggleMapLayerVisibility(MapLayer.linkPoint)}
                            checked={NetworkStore.isMapLayerVisible(MapLayer.linkPoint)}
                            content='Pisteet'
                        />
                    </div>
                    <div className={s.checkboxContainer}>
                        <Checkbox
                            onClick={this.toggleMapFilter(MapFilter.linkPoint)}
                            checked={MapStore.isMapFilterEnabled(MapFilter.linkPoint)}
                            content='Pisteiden sijainti (linkkinäkymässä)'
                        />
                    </div>
                    <div className={s.sectionDivider} />
                    <div className={s.inputTitle}>KARTTA</div>
                    <RadioButton
                        onClick={this.toggleMapOption(option.MAP)}
                        checked={this.state.selectedMapOption === option.MAP}
                        text={option.MAP}
                    />
                    <RadioButton
                        onClick={this.toggleMapOption(option.SATELLITE)}
                        checked={this.state.selectedMapOption === option.SATELLITE}
                        text={option.SATELLITE}
                    />
                    <RadioButton
                        onClick={this.toggleMapOption(option.TERRAIN)}
                        checked={this.state.selectedMapOption === option.TERRAIN}
                        text={option.TERRAIN}
                    />
                </div>
            </div>
        );
    }
}

export default MapLayersControl;
