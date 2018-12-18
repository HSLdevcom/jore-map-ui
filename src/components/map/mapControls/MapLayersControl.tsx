import * as React from 'react';
import { observer } from 'mobx-react';
import { IoMdMap } from 'react-icons/io';
import { TransitToggleButtonBar, Checkbox } from '~/components/controls/';
import TransitType from '~/enums/transitType';
import NetworkStore, { MapLayer } from '~/stores/networkStore';
import MapStore, { NodeLabel } from '~/stores/mapStore';
import { RadioButton } from '../../controls';
import * as s from './mapLayersControl.scss';

interface IMapLayersControlState {
    selectedMapOption: option;
}

interface IMapLayersControlProps {
}

enum option {
    MAP = 'Kartta',
    SATELLITE = 'Satelliitti',
    TERRAIN = 'Maasto',
}

@observer
export default class MapLayersControl extends React.Component
<IMapLayersControlProps, IMapLayersControlState> {
    constructor (props: any) {
        super(props);
        this.state = {
            selectedMapOption: option.MAP,
        };
    }

    public toggleTransitType = (type: TransitType) => {
        NetworkStore.toggleTransitType(type);
    }

    public toggleMapLayerVisibility = (mapLayer: MapLayer) => () => {
        NetworkStore.toggleMapLayerVisibility(mapLayer);
    }

    public toggleNodeLabelVisibility = (nodeLabel: NodeLabel) => () => {
        MapStore.toggleNodeLabelVisibility(nodeLabel);
    }

    private toggleMapOption = (option: option) => () => {
        this.setState({
            selectedMapOption: option,
        });
    }

    render() {
        return (
            <div className={s.mapLayerControlView}>
                <div className={s.mapLayerControlIcon}>
                    <IoMdMap />
                </div>

                <div className={s.mapLayersContainer}>
                    <div className={s.inputTitle}>VERKKO</div>
                    <TransitToggleButtonBar
                        toggleSelectedTransitType={this.toggleTransitType}
                        selectedTransitTypes={NetworkStore.selectedTransitTypes}
                    />
                    <div className={s.checkboxContainer}>
                        <Checkbox
                            onClick={this.toggleMapLayerVisibility(MapLayer.link)}
                            checked={NetworkStore.isMapLayerVisible(MapLayer.link)}
                            text={'Näytä alueen linkit'}
                        />
                    </div>
                    <div className={s.checkboxContainer}>
                        <Checkbox
                            onClick={this.toggleMapLayerVisibility(MapLayer.linkPoint)}
                            checked={NetworkStore.isMapLayerVisible(MapLayer.linkPoint)}
                            text={'Näytä linkkien pisteet'}
                        />
                    </div>
                    <div className={s.checkboxContainer}>
                        <Checkbox
                            onClick={this.toggleMapLayerVisibility(MapLayer.node)}
                            checked={NetworkStore.isMapLayerVisible(MapLayer.node)}
                            text={'Näytä alueen solmut'}
                        />
                    </div>
                    <div className={s.checkboxContainer}>
                        <Checkbox
                            onClick={this.toggleMapLayerVisibility(MapLayer.nodeWithoutLink)}
                            checked={NetworkStore.isMapLayerVisible(MapLayer.nodeWithoutLink)}
                            text={'Näytä linkittömät solmut'}
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
