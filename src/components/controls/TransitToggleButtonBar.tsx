import React from 'react';
import { observer } from 'mobx-react';
import TransitType from '~/enums/transitType';
import TransitToggleButton from './TransitToggleButton';
import * as s from './transitToggleButtonBar.scss';

interface ITtransitToggleButtonBarProps {
    selectedTransitTypes: TransitType[];
    toggleSelectedTransitType?: (type: TransitType) => void;
    disabled?: boolean;
    blurred?: boolean;
}

@observer
class TransitToggleButtonBar extends React.Component<ITtransitToggleButtonBarProps> {
    toggleType = (type: TransitType) => {
        if (this.props.toggleSelectedTransitType && !this.props.disabled) {
            this.props.toggleSelectedTransitType(type);
        }
    }

    public render() {
        return (
            <div className={s.transitToggleButtonBarView}>
                <TransitToggleButton
                    toggleActivity={this.toggleType}
                    toggled={this.props.selectedTransitTypes.includes(TransitType.BUS)}
                    type={TransitType.BUS}
                    disabled={this.props.disabled}
                />
                <TransitToggleButton
                    toggleActivity={this.toggleType}
                    toggled={this.props.selectedTransitTypes.includes(TransitType.TRAM)}
                    type={TransitType.TRAM}
                    disabled={this.props.disabled}
                />
                <TransitToggleButton
                    toggleActivity={this.toggleType}
                    toggled={this.props.selectedTransitTypes.includes(TransitType.TRAIN)}
                    type={TransitType.TRAIN}
                    disabled={this.props.disabled}
                />
                <TransitToggleButton
                    toggleActivity={this.toggleType}
                    toggled={this.props.selectedTransitTypes.includes(TransitType.SUBWAY)}
                    type={TransitType.SUBWAY}
                    disabled={this.props.disabled}
                />
                <TransitToggleButton
                    toggleActivity={this.toggleType}
                    toggled={this.props.selectedTransitTypes.includes(TransitType.FERRY)}
                    type={TransitType.FERRY}
                    disabled={this.props.disabled}
                />
                { this.props.blurred &&
                    <div className={s.blurredOverlay} />
                }
            </div>
        );
    }
}

export default TransitToggleButtonBar;
