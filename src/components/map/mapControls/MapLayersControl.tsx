import React, { ChangeEvent, MouseEvent } from 'react';
import { observer } from 'mobx-react';
import { IoMdMap } from 'react-icons/io';
import classnames from 'classnames';
import { TransitToggleButtonBar, Checkbox } from '~/components/controls/';
import TransitType from '~/enums/transitType';
import NetworkStore, { MapLayer } from '~/stores/networkStore';
import MapStore, { NodeLabel, MapFilter } from '~/stores/mapStore';
import { RadioButton } from '../../controls';
import NetworkDateControl from './NetworkDateControl';
import * as s from './mapLayersControl.scss';

interface IMapLayersControlState {
    selectedMapOption: option;
    show: boolean;
}

interface IMapLayersControlProps {
}

enum option {
    MAP = 'Kartta',
    SATELLITE = 'Satelliitti',
    TERRAIN = 'Maasto',
}

@observer
class MapLayersControl extends React.Component
<IMapLayersControlProps, IMapLayersControlState> {
    constructor (props: any) {
        super(props);
        this.state = {
            selectedMapOption: option.MAP,
            show: false,
        };
    }

    private toggleTransitType = (type: TransitType) => {
        NetworkStore.toggleTransitType(type);
    }

    private toggleMapLayerVisibility = (mapLayer: MapLayer) => () => {
        NetworkStore.toggleMapLayerVisibility(mapLayer);
    }

    private toggleMapFilter = (mapFilter: MapFilter) => () => {
        MapStore.toggleMapFilter(mapFilter);
    }

    private toggleNodeLabelVisibility = (nodeLabel: NodeLabel) => () => {
        MapStore.toggleNodeLabelVisibility(nodeLabel);
    }

    private toggleMapOption = (option: option) => () => {
        this.setState({
            selectedMapOption: option,
        });
    }

    private selectDate = (e: ChangeEvent<HTMLInputElement>) => {
        NetworkStore.setSelectedDate(e.target.value);
    }
    private showControls = (show: boolean) => (e:MouseEvent<HTMLDivElement>) => {
        // Fixes problem where clicking on anything causes mouse to 'leave' the element.
        if (!e.relatedTarget['innerHTML']) return;
        this.setState({ show });
    }
    render() {
        return (
            <div
                className={classnames(s.mapLayerControlView, this.state.show ? s.active : null)}
                onMouseEnter={this.showControls(true)}
                onMouseLeave={this.showControls(false)}
            >
                <div className={s.mapLayerControlIcon}>
                    <IoMdMap />
                </div>

                <div className={s.mapLayersContainer}>
                    <div className={s.inputTitle}>VERKKO</div>
                    <TransitToggleButtonBar
                        toggleSelectedTransitType={this.toggleTransitType}
                        selectedTransitTypes={NetworkStore.selectedTransitTypes}
                    />
                    <NetworkDateControl selectDate={this.selectDate}/>
                    <div className={s.sectionDivider} />
                    <div className={s.inputTitle}>GEOMETRIAT</div>
                    <div className={s.checkboxContainer}>
                        <Checkbox
                            onClick={this.toggleMapLayerVisibility(MapLayer.link)}
                            checked={NetworkStore.isMapLayerVisible(MapLayer.link)}
                            text={'Alueen linkit'}
                        />
                    </div>
                    <div className={s.checkboxContainer}>
                        <Checkbox
                            onClick={this.toggleMapLayerVisibility(MapLayer.linkPoint)}
                            checked={NetworkStore.isMapLayerVisible(MapLayer.linkPoint)}
                            text={'Linkkien pisteet'}
                        />
                    </div>
                    <div className={s.checkboxContainer}>
                        <Checkbox
                            onClick={this.toggleMapLayerVisibility(MapLayer.node)}
                            checked={NetworkStore.isMapLayerVisible(MapLayer.node)}
                            text={'Alueen solmut'}
                        />
                    </div>
                    <div className={s.checkboxContainer}>
                        <Checkbox
                            onClick={this.toggleMapLayerVisibility(MapLayer.nodeWithoutLink)}
                            checked={NetworkStore.isMapLayerVisible(MapLayer.nodeWithoutLink)}
                            text={'Linkittömät solmut'}
                        />
                    </div>
                    <div className={s.sectionDivider} />
                    <div className={s.inputTitle}>SOLMUT</div>
                        <div className={s.checkboxContainer}>
                            <Checkbox
                                onClick={this.toggleNodeLabelVisibility(NodeLabel.hastusId)}
                                checked={MapStore.isNodeLabelVisible(NodeLabel.hastusId)}
                                text={'Hastus id'}
                            />
                        </div>
                        <div className={s.checkboxContainer}>
                            <Checkbox
                                onClick={this.toggleNodeLabelVisibility(NodeLabel.longNodeId)}
                                checked={MapStore.isNodeLabelVisible(NodeLabel.longNodeId)}
                                text={'Pitkä solmun id'}
                            />
                        </div>
                        <div className={s.checkboxContainer}>
                            <Checkbox
                                onClick={this.toggleNodeLabelVisibility(NodeLabel.shortNodeId)}
                                checked={MapStore.isNodeLabelVisible(NodeLabel.shortNodeId)}
                                text={'Lyhyt solmun id'}
                            />
                        </div>
                    <div className={s.sectionDivider} />
                    <div className={s.inputTitle}>LINKIT</div>
                    <div className={s.checkboxContainer}>
                        <Checkbox
                            onClick={this.toggleMapFilter(MapFilter.arrowDecorator)}
                            checked={MapStore.isMapFilterEnabled(MapFilter.arrowDecorator)}
                            text={'Linkkien suuntanuolet'}
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
