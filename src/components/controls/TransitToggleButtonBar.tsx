import { observer } from 'mobx-react';
import React from 'react';
import TransitType from '~/enums/transitType';
import TransitToggleButton from './TransitToggleButton';
import * as s from './transitToggleButtonBar.scss';

interface ITtransitToggleButtonBarProps {
    selectedTransitTypes: TransitType[];
    toggleSelectedTransitType?: (type: TransitType) => void;
    errorMessage?: string;
    disabled?: boolean;
    blurred?: boolean;
}

const TransitToggleButtonBar = observer((props: ITtransitToggleButtonBarProps) => {
    const toggleType = (type: TransitType) => {
        if (props.toggleSelectedTransitType && !props.disabled) {
            props.toggleSelectedTransitType(type);
        }
    };

    return (
        <div>
            <div className={s.transitToggleButtonBarView}>
                <TransitToggleButton
                    toggleActivity={toggleType}
                    toggled={props.selectedTransitTypes.includes(TransitType.BUS)}
                    type={TransitType.BUS}
                    disabled={props.disabled}
                />
                <TransitToggleButton
                    toggleActivity={toggleType}
                    toggled={props.selectedTransitTypes.includes(TransitType.TRAM)}
                    type={TransitType.TRAM}
                    disabled={props.disabled}
                />
                <TransitToggleButton
                    toggleActivity={toggleType}
                    toggled={props.selectedTransitTypes.includes(TransitType.TRAIN)}
                    type={TransitType.TRAIN}
                    disabled={props.disabled}
                />
                <TransitToggleButton
                    toggleActivity={toggleType}
                    toggled={props.selectedTransitTypes.includes(TransitType.SUBWAY)}
                    type={TransitType.SUBWAY}
                    disabled={props.disabled}
                />
                <TransitToggleButton
                    toggleActivity={toggleType}
                    toggled={props.selectedTransitTypes.includes(TransitType.FERRY)}
                    type={TransitType.FERRY}
                    disabled={props.disabled}
                />
                {props.blurred && <div className={s.blurredOverlay} />}
            </div>
            {props.errorMessage && (
                <div className={s.errorText}>
                    <div>{props.errorMessage}</div>
                </div>
            )}
        </div>
    );
});

export default TransitToggleButtonBar;
