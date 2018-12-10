import * as React from 'react';
import { observer } from 'mobx-react';
import TransitType from '~/enums/transitType';
import TransitToggleButton from './TransitToggleButton';
import * as s from './transitToggleButtonBar.scss';

interface ITtransitToggleButtonBarProps {
    selectedTransitTypes: TransitType[];
    toggleSelectedTransitType?: (type: TransitType) => void;
}

@observer
class TransitToggleButtonBar extends React.Component<ITtransitToggleButtonBarProps> {
    toggleType = (type: TransitType) => {
        if (this.props.toggleSelectedTransitType) {
            this.props.toggleSelectedTransitType(type);
        }
    }

    public render(): any {
        return (
            <div className={s.transitToggleButtonBarView}>
                <TransitToggleButton
                    toggleActivity={this.toggleType}
                    toggled={this.props.selectedTransitTypes.includes(TransitType.BUS)}
                    type={TransitType.BUS}
                />
                <TransitToggleButton
                    toggleActivity={this.toggleType}
                    toggled={this.props.selectedTransitTypes.includes(TransitType.TRAM)}
                    type={TransitType.TRAM}
                />
                <TransitToggleButton
                    toggleActivity={this.toggleType}
                    toggled={this.props.selectedTransitTypes.includes(TransitType.TRAIN)}
                    type={TransitType.TRAIN}
                />
                <TransitToggleButton
                    toggleActivity={this.toggleType}
                    toggled={this.props.selectedTransitTypes.includes(TransitType.SUBWAY)}
                    type={TransitType.SUBWAY}
                />
                <TransitToggleButton
                    toggleActivity={this.toggleType}
                    toggled={this.props.selectedTransitTypes.includes(TransitType.FERRY)}
                    type={TransitType.FERRY}
                />
            </div>
        );
    }
}

export default TransitToggleButtonBar;
