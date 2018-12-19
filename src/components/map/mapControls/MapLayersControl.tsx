import React, { ChangeEvent } from 'react';
import { observer } from 'mobx-react';
import { IoMdMap } from 'react-icons/io';
import { TransitToggleButtonBar, Checkbox } from '~/components/controls/';
import TransitType from '~/enums/transitType';
import NetworkStore from '~/stores/networkStore';
import MapStore, { NodeLabel } from '~/stores/mapStore';
import { RadioButton } from '../../controls';
import NetworkDateControl from './NetworkDateControl';
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
class MapLayersControl extends React.Component
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

    public toggleLinkVisibility = () => {
        NetworkStore.toggleLinkVisibility();
    }

    public toggleNodeVisibility = () => {
        NetworkStore.toggleNodeVisibility();
    }

    public togglePointVisibility = () => {
        NetworkStore.togglePointVisibility();
    }

    public toggleNodeLabel = (nodeLabel: NodeLabel) => () => {
        MapStore.toggleVisibleNodeLabel(nodeLabel);
    }

    private toggleMapOption = (option: option) => () => {
        this.setState({
            selectedMapOption: option,
        });
    }

    private selectDate = (e: ChangeEvent<HTMLInputElement>) => {
        NetworkStore.setSelectedDate(e.target.value);
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
                    <NetworkDateControl selectDate={this.selectDate}/>
                    <div className={s.sectionDivider} />
                    <div className={s.checkboxContainer}>
                        <Checkbox
                            onClick={this.toggleLinkVisibility}
                            checked={NetworkStore.isLinksVisible}
                            text={'Näytä alueen linkit'}
                        />
                    </div>
                    <div className={s.checkboxContainer}>
                        <Checkbox
                            onClick={this.togglePointVisibility}
                            checked={NetworkStore.isPointsVisible}
                            text={'Näytä linkkien pisteet'}
                        />
                    </div>
                    <div className={s.checkboxContainer}>
                        <Checkbox
                            onClick={this.toggleNodeVisibility}
                            checked={NetworkStore.isNodesVisible}
                            text={'Näytä alueen solmut'}
                        />
                    </div>
                    <div className={s.sectionDivider} />
                    <div className={s.inputTitle}>SOLMUT</div>
                        <div className={s.checkboxContainer}>
                            <Checkbox
                                onClick={this.toggleNodeLabel(NodeLabel.hastusId)}
                                checked={MapStore.isNodeLabelVisible(NodeLabel.hastusId)}
                                text={'Hastus id'}
                            />
                        </div>
                        <div className={s.checkboxContainer}>
                            <Checkbox
                                onClick={this.toggleNodeLabel(NodeLabel.longNodeId)}
                                checked={MapStore.isNodeLabelVisible(NodeLabel.longNodeId)}
                                text={'Pitkä solmun tunnus'}
                            />
                        </div>
                        <div className={s.checkboxContainer}>
                            <Checkbox
                                onClick={this.toggleNodeLabel(NodeLabel.shortNodeId)}
                                checked={MapStore.isNodeLabelVisible(NodeLabel.shortNodeId)}
                                text={'Lyhyt solmun tunnus'}
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
