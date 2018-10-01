import * as React from 'react';
import { observer } from 'mobx-react';
import TransitToggleButton from './TransitToggleButton';
import TransitType from '../../enums/transitType';
import * as s from './transitToggleButtonBar.scss';

interface ITtransitToggleButtonBarProps {
    selectedTypes: TransitType[];
    toggleSelectedTypes: (type: TransitType) => void;
}

@observer
class TransitToggleButtonBar extends React.Component<ITtransitToggleButtonBarProps> {
    public render(): any {
        return (
            <div className={s.transitToggleButtonBarView}>
                <TransitToggleButton
                    toggleActivity={this.props.toggleSelectedTypes}
                    toggled={this.props.selectedTypes.includes(TransitType.BUS)}
                    type={TransitType.BUS}
                />
                <TransitToggleButton
                    toggleActivity={this.props.toggleSelectedTypes}
                    toggled={this.props.selectedTypes.includes(TransitType.TRAM)}
                    type={TransitType.TRAM}
                />
                <TransitToggleButton
                    toggleActivity={this.props.toggleSelectedTypes}
                    toggled={this.props.selectedTypes.includes(TransitType.TRAIN)}
                    type={TransitType.TRAIN}
                />
                <TransitToggleButton
                    toggleActivity={this.props.toggleSelectedTypes}
                    toggled={this.props.selectedTypes.includes(TransitType.SUBWAY)}
                    type={TransitType.SUBWAY}
                />
                <TransitToggleButton
                    toggleActivity={this.props.toggleSelectedTypes}
                    toggled={this.props.selectedTypes.includes(TransitType.FERRY)}
                    type={TransitType.FERRY}
                />
            </div>
        );
    }
}

export default TransitToggleButtonBar;
