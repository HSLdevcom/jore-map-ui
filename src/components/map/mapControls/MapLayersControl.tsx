import * as React from 'react';
import { observer } from 'mobx-react';
import { IoMdMap } from 'react-icons/io';
import { TransitToggleButtonBar, Checkbox } from '~/components/controls/';
import TransitType from '~/enums/transitType';
import NetworkStore from '~/stores/networkStore';
import { RadioButton } from '../../controls';
import * as s from './mapLayersControl.scss';

interface IMapLayersControlState {
    selectedOption: option;
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
            selectedOption: option.MAP,
        };
    }

    private toggleRadioButton = (option: option) => () => {
        this.setState({
            selectedOption: option,
        });
    }

    public toggleTransitType = (type: TransitType) => {
        NetworkStore.toggleTransitType(type);
    }

    public toggleIsLinksVisible = () => {
        NetworkStore.toggleIsLinksVisible();
    }

    public toggleIsNodesVisible = () => {
        NetworkStore.toggleIsNodesVisible();
    }

    public toggleIsPointsVisible = () => {
        NetworkStore.toggleIsPointsVisible();
    }

    render() {
        return (
            <div className={s.mapLayerControlView}>
                <div className={s.mapLayerControlIcon}>
                    <IoMdMap />
                </div>

                <div className={s.mapLayersContainer}>
                    <div className={s.flexColumn}>
                        <div className={s.networkToggleView}>
                            <div className={s.inputTitle}>VERKKO</div>
                            <TransitToggleButtonBar
                                toggleSelectedTransitType={this.toggleTransitType}
                                selectedTransitTypes={NetworkStore.selectedTransitTypes}
                            />
                            <div className={s.checkboxContainer}>
                                <Checkbox
                                    onClick={this.toggleIsLinksVisible}
                                    checked={NetworkStore.isLinksVisible}
                                    text={'Näytä alueen linkit'}
                                />
                            </div>
                            <div className={s.checkboxContainer}>
                                <Checkbox
                                    onClick={this.toggleIsPointsVisible}
                                    checked={NetworkStore.isPointsVisible}
                                    text={'Näytä linkkien pisteet'}
                                />
                            </div>
                            <div className={s.checkboxContainer}>
                                <Checkbox
                                    onClick={this.toggleIsNodesVisible}
                                    checked={NetworkStore.isNodesVisible}
                                    text={'Näytä alueen solmut'}
                                />
                            </div>
                        </div>
                        <div className={s.mapLayerToggleView}>
                            <div className={s.inputTitle}>KARTTA</div>
                            <RadioButton
                                onClick={this.toggleRadioButton(option.MAP)}
                                checked={this.state.selectedOption === option.MAP}
                                text={option.MAP}
                            />
                            <RadioButton
                                onClick={this.toggleRadioButton(option.SATELLITE)}
                                checked={this.state.selectedOption === option.SATELLITE}
                                text={option.SATELLITE}
                            />
                            <RadioButton
                                onClick={this.toggleRadioButton(option.TERRAIN)}
                                checked={this.state.selectedOption === option.TERRAIN}
                                text={option.TERRAIN}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
