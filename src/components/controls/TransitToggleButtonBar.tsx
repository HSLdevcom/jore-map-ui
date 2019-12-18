import { observer } from 'mobx-react';
import React from 'react';
import TransitType from '~/enums/transitType';
import TransitToggleButton from './TransitToggleButton';
import * as s from './transitToggleButtonBar.scss';

interface ITtransitToggleButtonBarProps {
    selectedTransitTypes: TransitType[];
    toggleSelectedTransitType?: (type: TransitType | null) => void;
    errorMessage?: string;
    disabled?: boolean;
    blurred?: boolean;
}

const TransitToggleButtonBar = observer((props: ITtransitToggleButtonBarProps) => {
    const {
        selectedTransitTypes,
        toggleSelectedTransitType,
        errorMessage,
        disabled,
        blurred
    } = props;
    const toggleType = (type: TransitType) => {
        if (toggleSelectedTransitType && !disabled) {
            toggleSelectedTransitType(type);
        }
    };

    return (
        <div>
            <div className={s.transitToggleButtonBarView}>
                <TransitToggleButton
                    toggleActivity={toggleType}
                    toggled={selectedTransitTypes.includes(TransitType.BUS)}
                    type={TransitType.BUS}
                    disabled={disabled}
                />
                <TransitToggleButton
                    toggleActivity={toggleType}
                    toggled={selectedTransitTypes.includes(TransitType.TRAM)}
                    type={TransitType.TRAM}
                    disabled={disabled}
                />
                <TransitToggleButton
                    toggleActivity={toggleType}
                    toggled={selectedTransitTypes.includes(TransitType.TRAIN)}
                    type={TransitType.TRAIN}
                    disabled={disabled}
                />
                <TransitToggleButton
                    toggleActivity={toggleType}
                    toggled={selectedTransitTypes.includes(TransitType.SUBWAY)}
                    type={TransitType.SUBWAY}
                    disabled={disabled}
                />
                <TransitToggleButton
                    toggleActivity={toggleType}
                    toggled={selectedTransitTypes.includes(TransitType.FERRY)}
                    type={TransitType.FERRY}
                    disabled={disabled}
                />
                {blurred && <div className={s.blurredOverlay} />}
            </div>
            {errorMessage && (
                <div className={s.errorText}>
                    <div>{errorMessage}</div>
                </div>
            )}
        </div>
    );
});

export default TransitToggleButtonBar;
